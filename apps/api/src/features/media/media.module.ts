import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { ALLOWED_MEDIA_MIME_TYPES } from '../../common/utils/file-validation';

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const maxSizeMb = config.get<number>('FILE_MAX_SIZE_MB', 10);
        return {
          limits: { fileSize: maxSizeMb * 1024 * 1024 },
          fileFilter: (req, file, cb) => {
            const type = (req.query?.type as string) ?? '';
            const allowed = ALLOWED_MEDIA_MIME_TYPES[type];
            if (!allowed) {
              return cb(new BadRequestException('Missing or invalid media type'), false);
            }
            if (!allowed.includes(file.mimetype)) {
              return cb(new BadRequestException(`File type ${file.mimetype} is not allowed for ${type}`), false);
            }
            cb(null, true);
          },
        };
      },
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
