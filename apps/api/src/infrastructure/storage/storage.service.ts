import { Injectable } from '@nestjs/common';
import { StorageProvider, UploadResult } from './storage.types';

@Injectable()
export class StorageService {
  constructor(private readonly provider: StorageProvider) {}

  get driver(): string {
    return this.provider.driver;
  }

  uploadFile(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    return this.provider.uploadFile(file, folder);
  }

  deleteFile(storageKey: string): Promise<void> {
    return this.provider.deleteFile(storageKey);
  }

  resolvePublicUrl(value: string | null | undefined): Promise<string | null> {
    return this.provider.resolvePublicUrl(value);
  }

  deriveStorageKey(url: string): string {
    return this.provider.deriveStorageKey(url);
  }
}
