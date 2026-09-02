import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { StorageProvider, UploadResult } from './storage.types';

@Injectable()
export class S3StorageProvider extends StorageProvider {
  readonly driver = 's3';
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;
  private readonly urlExpiresIn: number;
  private readonly logger = new Logger(S3StorageProvider.name);

  constructor(private config: ConfigService) {
    super();
    this.bucket = config.get<string>('S3_BUCKET', '');
    this.publicBaseUrl = config.get<string>('S3_PUBLIC_BASE_URL', '').replace(/\/+$/, '');
    this.urlExpiresIn = config.get<number>('S3_URL_EXPIRES_IN_SECONDS', 3600);

    this.client = new S3Client({
      region: config.get<string>('S3_REGION', 'us-east-1'),
      endpoint: config.get<string>('S3_ENDPOINT') || undefined,
      forcePathStyle: config.get<string>('S3_FORCE_PATH_STYLE') === 'true',
      credentials: {
        accessKeyId: config.get<string>('S3_ACCESS_KEY_ID', ''),
        secretAccessKey: config.get<string>('S3_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const ext = path.extname(file.originalname);
    const storageKey = `${folder}/${randomUUID()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    this.logger.log(`File uploaded: ${storageKey}`);
    const url = this.publicBaseUrl ? `${this.publicBaseUrl}/${storageKey}` : storageKey;
    return { url, storageKey };
  }

  async deleteFile(storageKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }),
    );
    this.logger.log(`File deleted: ${storageKey}`);
  }

  async resolvePublicUrl(value: string | null | undefined): Promise<string | null> {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    const signed = await getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: value }),
      { expiresIn: this.urlExpiresIn },
    );
    return signed;
  }

  deriveStorageKey(url: string): string {
    if (this.publicBaseUrl && url.startsWith(`${this.publicBaseUrl}/`)) {
      return url.slice(this.publicBaseUrl.length + 1);
    }
    const parsed = new URL(url);
    const cleanPath = decodeURIComponent(parsed.pathname).replace(/^\//, '');
    if (!cleanPath || cleanPath === this.bucket) return '';
    if (parsed.hostname.includes('amazonaws.com')) {
      const idx = cleanPath.indexOf('/');
      if (idx === -1) return '';
      const bucketPart = cleanPath.slice(0, idx);
      const rest = cleanPath.slice(idx + 1);
      return bucketPart === this.bucket ? rest : cleanPath;
    }
    return cleanPath;
  }
}
