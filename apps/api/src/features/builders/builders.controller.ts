import { Controller, Get, Patch, Body, Post, UseGuards, UploadedFile, UseInterceptors, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { BuildersService } from './builders.service';
import { UpdateBuilderDto } from './dto/update-builder.dto';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto/portfolio.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { StorageService } from '../../infrastructure/storage/storage.service';

@ApiTags('Builders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUILDER)
@Controller('builders')
export class BuildersController {
  constructor(
    private buildersService: BuildersService,
    private storageService: StorageService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get own builder profile' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.buildersService.getProfile(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own builder profile' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateBuilderDto,
  ) {
    return this.buildersService.updateProfile(user.sub, dto);
  }

  @Post('me/documents')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload verification document' })
  async uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.storageService.uploadFile(file, `builders/${user.sub}/docs`);
    return this.buildersService.uploadDocuments(user.sub, [{ type: file.mimetype, url: result.url }]);
  }

  @Post('me/logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload company logo' })
  async uploadLogo(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.storageService.uploadFile(file, `builders/${user.sub}/logo`);
    return this.buildersService.updateProfile(user.sub, { logo: result.url });
  }

  @Get('me/portfolio')
  @ApiOperation({ summary: 'List my portfolio projects' })
  async listPortfolio(@CurrentUser() user: AuthenticatedUser) {
    return this.buildersService.listPortfolio(user.sub);
  }

  @Post('me/portfolio')
  @ApiOperation({ summary: 'Create portfolio project' })
  async createPortfolio(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePortfolioDto,
  ) {
    return this.buildersService.createPortfolio(user.sub, dto);
  }

  @Patch('me/portfolio/:id')
  @ApiOperation({ summary: 'Update portfolio project' })
  async updatePortfolio(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePortfolioDto,
  ) {
    return this.buildersService.updatePortfolio(user.sub, id, dto);
  }

  @Delete('me/portfolio/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete portfolio project' })
  async deletePortfolio(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.buildersService.deletePortfolio(user.sub, id);
  }

  @Get('me/reviews')
  @ApiOperation({ summary: 'List reviews received for my company' })
  async listReviews(@CurrentUser() user: AuthenticatedUser) {
    return this.buildersService.listReviews(user.sub);
  }
}
