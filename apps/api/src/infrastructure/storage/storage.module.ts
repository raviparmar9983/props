import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';
import { StorageProvider } from './storage.types';

@Global()
@Module({
  providers: [
    {
      provide: StorageProvider,
      useFactory: (config: ConfigService) => {
        const driver = config.get<string>('STORAGE_DRIVER', 'local');
        if (driver === 's3') return new S3StorageProvider(config);
        return new LocalStorageProvider(config);
      },
      inject: [ConfigService],
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
