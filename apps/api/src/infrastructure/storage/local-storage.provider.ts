import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { StorageProvider, UploadResult } from './storage.types';

@Injectable()
export class LocalStorageProvider extends StorageProvider {
  readonly driver = 'local';
  private readonly uploadDir: string;
  private readonly baseUrl: string;
  private readonly logger = new Logger(LocalStorageProvider.name);

  constructor(private config: ConfigService) {
    super();
    this.uploadDir = config.get<string>('FILE_UPLOAD_DIR', './uploads');
    this.baseUrl = config
      .get<string>('FILE_UPLOAD_BASE_URL', 'http://localhost:4000/uploads')
      .replace(/\/+$/, '');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const ext = path.extname(file.originalname);
    const key = `${folder}/${randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, file.buffer);
    this.logger.log(`File uploaded: ${key}`);
    // Return an origin-relative URL so every client builds its own public URL
    // (localhost in the URL would be unreachable from customer/mobile devices).
    return { url: `/uploads/${key}`, storageKey: key };
  }

  async deleteFile(storageKey: string): Promise<void> {
    const filePath = path.join(this.uploadDir, storageKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.log(`File deleted: ${storageKey}`);
    }
  }

  async resolvePublicUrl(value: string | null | undefined): Promise<string | null> {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) {
      // Strip the scheme/host so clients resolve against their own API origin.
      try {
        const parsed = new URL(value);
        if (parsed.pathname.startsWith('/uploads/')) return parsed.pathname;
      } catch {
        return value;
      }
      return value;
    }
    const cleaned = value.startsWith('/') ? value : `/${value}`;
    return cleaned.startsWith('/uploads/') ? cleaned : `/uploads${cleaned}`;
  }

  deriveStorageKey(url: string): string {
    const clean = url.startsWith('http') ? new URL(url).pathname : url;
    if (clean.startsWith('/uploads/')) return clean.slice('/uploads/'.length);
    if (clean.startsWith('/')) return clean.slice(1);
    return clean;
  }
}
