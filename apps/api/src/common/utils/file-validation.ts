import { BadRequestException } from '@nestjs/common';

export const ALLOWED_MEDIA_MIME_TYPES: Record<string, string[]> = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'],
  FLOOR_PLAN: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  BROCHURE: ['application/pdf', 'image/jpeg', 'image/png'],
  MASTER_PLAN: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};

export function sniffFileType(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }
  const head = buffer.subarray(0, 6).toString('latin1');
  if (head === 'GIF87a' || head === 'GIF89a') return 'image/gif';
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buffer.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'image/webp';
  }
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) return 'image/bmp';
  if (buffer.subarray(0, 5).toString('latin1') === '%PDF-') return 'application/pdf';
  if (buffer.subarray(4, 8).toString('latin1') === 'ftyp') return 'video/mp4';
  return null;
}

export function assertFileMatchesType(type: string, file: Express.Multer.File): void {
  const allowed = ALLOWED_MEDIA_MIME_TYPES[type];
  if (!allowed) throw new BadRequestException(`Unsupported media type: ${type}`);
  if (!file) throw new BadRequestException('No file provided');
  if (!allowed.includes(file.mimetype)) {
    throw new BadRequestException(`File type ${file.mimetype} is not allowed for ${type}`);
  }
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    const sniffed = sniffFileType(file.buffer);
    if (!sniffed || !allowed.includes(sniffed)) {
      throw new BadRequestException('File content does not match the declared type');
    }
  }
}
