import { Injectable } from '@nestjs/common';

export interface UploadResult {
  url: string;
  storageKey: string;
}

@Injectable()
export abstract class StorageProvider {
  abstract readonly driver: string;
  abstract uploadFile(file: Express.Multer.File, folder: string): Promise<UploadResult>;
  abstract deleteFile(storageKey: string): Promise<void>;
  abstract resolvePublicUrl(value: string | null | undefined): Promise<string | null>;
  abstract deriveStorageKey(url: string): string;
}
