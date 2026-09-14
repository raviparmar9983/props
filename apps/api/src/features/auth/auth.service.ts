import { Injectable, Logger, ConflictException, BadRequestException, UnauthorizedException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID, randomInt } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { RegisterBuilderDto } from './dto/register-builder.dto';
import { LoginDto } from './dto/login.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  private async issueTokens(user: { id: string; email: string; role: UserRole }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRY', '15m'),
    });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRY', '7d'),
      },
    );
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const refreshExpiry = this.config.get<string>('JWT_REFRESH_EXPIRY', '7d');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(/^(\d+)d$/.exec(refreshExpiry)?.[1] ?? 7));
    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });
    return { accessToken, refreshToken };
  }

  async registerBuilder(dto: RegisterBuilderDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const city = await this.prisma.city.findUnique({ where: { id: dto.cityId } });
    if (!city) throw new BadRequestException('Invalid city ID');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const slug = await this.generateBuilderSlug(dto.companyName);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: UserRole.BUILDER,
        builderProfile: {
          create: {
            companyName: dto.companyName,
            slug,
            cityId: dto.cityId,
            phone: dto.phone,
          },
        },
      },
      include: { builderProfile: true },
    });

    this.logger.log(`Builder registered: ${user.email}`);

    // Auto-send email verification OTP
    try {
      await this.sendBuilderEmailVerification(dto.email);
    } catch (err) {
      this.logger.error(`Failed to send verification email to ${dto.email}`, err);
    }

    return {
      userId: user.id,
      builderId: user.builderProfile!.id,
      verificationStatus: 'PENDING',
      message: 'Registration successful. A verification code has been sent to your email. Please verify to activate your account.',
    };
  }

  async loginBuilder(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { builderProfile: true },
    });
    if (!user || user.role !== UserRole.BUILDER) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account suspended');
    }

    // A builder must verify their email before they can sign in.
    if (!user.isEmailVerified) {
      const expiryMinutes = this.config.get<number>('OTP_EXPIRY_MINUTES', 5);
      const cooldownSeconds = this.config.get<number>('OTP_RESEND_COOLDOWN_SECONDS', 30);
      const elapsedSeconds = await this.secondsSinceLastEmailOtp(user.email);

      let resendInSeconds = Math.max(0, Math.ceil(cooldownSeconds - elapsedSeconds));
      if (elapsedSeconds >= cooldownSeconds) {
        try {
          await this.sendBuilderEmailVerification(user.email);
        } catch (err) {
          this.logger.error(`Failed to send verification email to ${user.email}`, err);
        }
        resendInSeconds = cooldownSeconds;
      }

      return {
        requiresEmailVerification: true,
        email: user.email,
        expiresInSeconds: expiryMinutes * 60,
        resendInSeconds,
        message: 'Please verify your email to finish setting up your account.',
      };
    }

    const tokens = await this.issueTokens(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        verificationStatus: user.builderProfile?.verificationStatus ?? 'PENDING',
      },
    };
  }

  async loginAdmin(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account suspended');
    }
    const tokens = await this.issueTokens(user);
    return {
      ...tokens,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async requestOtp(dto: OtpRequestDto) {
    const otpLength = this.config.get<number>('OTP_LENGTH', 6);
    const expiryMinutes = this.config.get<number>('OTP_EXPIRY_MINUTES', 5);
    const cooldownSeconds = this.config.get<number>('OTP_RESEND_COOLDOWN_SECONDS', 30);

    const lastRecord = await this.prisma.otpVerification.findFirst({
      where: { email: dto.email, purpose: 'LOGIN' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    if (lastRecord) {
      const elapsedSeconds = (Date.now() - lastRecord.createdAt.getTime()) / 1000;
      if (elapsedSeconds < cooldownSeconds) {
        throw new HttpException(
          {
            message: `Please wait ${Math.ceil(cooldownSeconds - elapsedSeconds)}s before requesting another code`,
            error: 'OTP_COOLDOWN',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const otpCode = this.generateOtp(otpLength);
    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: {
        email: dto.email,
        otpHash,
        purpose: 'LOGIN',
        attempts: 0,
        expiresAt,
      },
    });

    this.mailService.sendOtpEmail(dto.email, otpCode);

    return {
      message: 'OTP sent',
      expiresInSeconds: expiryMinutes * 60,
      resendInSeconds: cooldownSeconds,
    };
  }

  async verifyOtp(dto: OtpVerifyDto) {
    const maxAttempts = this.config.get<number>('OTP_MAX_ATTEMPTS', 5);

    const record = await this.prisma.otpVerification.findFirst({
      where: { email: dto.email, purpose: 'LOGIN', isUsed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) throw new BadRequestException('No OTP found. Please request a new one.', 'OTP_NOT_FOUND');
    if (record.expiresAt < new Date()) throw new BadRequestException('OTP has expired', 'OTP_EXPIRED');
    if (record.attempts >= maxAttempts) throw new BadRequestException('OTP locked due to too many attempts', 'OTP_LOCKED');

    const valid = await bcrypt.compare(dto.otp, record.otpHash);
    if (!valid) {
      await this.prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = maxAttempts - record.attempts - 1;
      if (remaining <= 0) {
        throw new BadRequestException('OTP locked due to too many attempts', 'OTP_LOCKED');
      }
      throw new BadRequestException(`Invalid OTP. ${remaining} attempts remaining`, 'OTP_INVALID');
    }

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { isUsed: true },
    });

    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { email: dto.email, role: UserRole.CUSTOMER, isEmailVerified: true },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });
    }

    const tokens = await this.issueTokens(user);
    return {
      ...tokens,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!stored) throw new UnauthorizedException('Refresh token not found');

    const valid = await bcrypt.compare(refreshToken, stored.tokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account not found or suspended');
    }

    const tokens = await this.issueTokens(user);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      return { message: 'If an account exists with this email, a password reset code has been sent.' };
    }

    const cooldownSeconds = this.config.get<number>('OTP_RESEND_COOLDOWN_SECONDS', 30);
    const lastRecord = await this.prisma.otpVerification.findFirst({
      where: { email: dto.email, purpose: 'PASSWORD_RESET' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    if (lastRecord) {
      const elapsedSeconds = (Date.now() - lastRecord.createdAt.getTime()) / 1000;
      if (elapsedSeconds < cooldownSeconds) {
        throw new HttpException(
          {
            message: `Please wait ${Math.ceil(cooldownSeconds - elapsedSeconds)}s before requesting another code`,
            error: 'OTP_COOLDOWN',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const otpLength = this.config.get<number>('OTP_LENGTH', 6);
    const expiryMinutes = this.config.get<number>('OTP_EXPIRY_MINUTES', 5);
    const otpCode = this.generateOtp(otpLength);
    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: {
        email: dto.email,
        otpHash,
        purpose: 'PASSWORD_RESET',
        attempts: 0,
        expiresAt,
      },
    });

     this.mailService.sendPasswordResetEmail(dto.email, otpCode);

    return {
      message: 'If an account exists with this email, a password reset code has been sent.',
      expiresInSeconds: expiryMinutes * 60,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const maxAttempts = this.config.get<number>('OTP_MAX_ATTEMPTS', 5);

    const record = await this.prisma.otpVerification.findFirst({
      where: { email: dto.email, purpose: 'PASSWORD_RESET', isUsed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) throw new BadRequestException('No OTP found. Please request a new one.', 'OTP_NOT_FOUND');
    if (record.expiresAt < new Date()) throw new BadRequestException('OTP has expired', 'OTP_EXPIRED');
    if (record.attempts >= maxAttempts) throw new BadRequestException('OTP locked due to too many attempts', 'OTP_LOCKED');

    const valid = await bcrypt.compare(dto.otp, record.otpHash);
    if (!valid) {
      await this.prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = maxAttempts - record.attempts - 1;
      if (remaining <= 0) {
        throw new BadRequestException('OTP locked due to too many attempts', 'OTP_LOCKED');
      }
      throw new BadRequestException(`Invalid OTP. ${remaining} attempts remaining`, 'OTP_INVALID');
    }

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { isUsed: true },
    });

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new BadRequestException('User not found', 'USER_NOT_FOUND');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Revoke all existing refresh tokens for this user
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password reset successful. You can now sign in with your new password.' };
  }

  async requestBuilderEmailVerification(dto: OtpRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { builderProfile: true },
    });
    if (!user || user.role !== UserRole.BUILDER) {
      throw new BadRequestException('No builder account found with this email');
    }
    if (user.isEmailVerified) {
      return { message: 'Email already verified.' };
    }

    await this.sendBuilderEmailVerification(dto.email);

    const expiryMinutes = this.config.get<number>('OTP_EXPIRY_MINUTES', 5);
    const cooldownSeconds = this.config.get<number>('OTP_RESEND_COOLDOWN_SECONDS', 30);
    return {
      message: 'Verification code sent',
      expiresInSeconds: expiryMinutes * 60,
      resendInSeconds: cooldownSeconds,
    };
  }

  async verifyBuilderEmail(dto: OtpVerifyDto) {
    const maxAttempts = this.config.get<number>('OTP_MAX_ATTEMPTS', 5);

    const record = await this.prisma.otpVerification.findFirst({
      where: { email: dto.email, purpose: 'EMAIL_VERIFICATION', isUsed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) throw new BadRequestException('No verification code found. Please request a new one.', 'OTP_NOT_FOUND');
    if (record.expiresAt < new Date()) throw new BadRequestException('Verification code has expired', 'OTP_EXPIRED');
    if (record.attempts >= maxAttempts) throw new BadRequestException('Too many attempts. Please request a new code.', 'OTP_LOCKED');

    const valid = await bcrypt.compare(dto.otp, record.otpHash);
    if (!valid) {
      await this.prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = maxAttempts - record.attempts - 1;
      if (remaining <= 0) {
        throw new BadRequestException('Too many attempts. Please request a new code.', 'OTP_LOCKED');
      }
      throw new BadRequestException(`Invalid code. ${remaining} attempts remaining`, 'OTP_INVALID');
    }

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { isUsed: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { builderProfile: true },
    });
    if (!user || !user.builderProfile) {
      throw new BadRequestException('Builder account not found');
    }

    // Mark the email as verified — email verification is the only gate for
    // builder access. This also acts as a full sign-in so the confirmation
    // page can pick up the session straight away.
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    const tokens = await this.issueTokens(user);

    this.logger.log(`Builder ${user.email} verified email via OTP`);

    return {
      ...tokens,
      message: 'Email verified successfully. Your account is now active.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        verificationStatus: user.builderProfile.verificationStatus,
      },
    };
  }

  private async sendBuilderEmailVerification(email: string) {
    const otpLength = this.config.get<number>('OTP_LENGTH', 6);
    const expiryMinutes = this.config.get<number>('OTP_EXPIRY_MINUTES', 5);
    const cooldownSeconds = this.config.get<number>('OTP_RESEND_COOLDOWN_SECONDS', 30);

    const lastRecord = await this.prisma.otpVerification.findFirst({
      where: { email, purpose: 'EMAIL_VERIFICATION' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    if (lastRecord) {
      const elapsedSeconds = (Date.now() - lastRecord.createdAt.getTime()) / 1000;
      if (elapsedSeconds < cooldownSeconds) {
        throw new HttpException(
          {
            message: `Please wait ${Math.ceil(cooldownSeconds - elapsedSeconds)}s before requesting another code`,
            error: 'OTP_COOLDOWN',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const otpCode = this.generateOtp(otpLength);
    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: {
        email,
        otpHash,
        purpose: 'EMAIL_VERIFICATION',
        attempts: 0,
        expiresAt,
      },
    });

     this.mailService.sendEmailVerification(email, otpCode);
  }

  private async secondsSinceLastEmailOtp(email: string): Promise<number> {
    const last = await this.prisma.otpVerification.findFirst({
      where: { email, purpose: 'EMAIL_VERIFICATION' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    return last ? (Date.now() - last.createdAt.getTime()) / 1000 : Number.POSITIVE_INFINITY;
  }

  private generateOtp(length: number): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += randomInt(0, 10).toString();
    }
    return otp;
  }

  private async generateBuilderSlug(companyName: string): Promise<string> {
    const base = companyName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = base;
    let counter = 1;
    while (await this.prisma.builderProfile.findUnique({ where: { slug } })) {
      slug = `${base}-${counter}`;
      counter++;
    }
    return slug;
  }
}
