import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as path from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        // Uploads are embedded cross-origin by the customer web app
        // (e.g. localhost:3000 loading images from the API), so we must
        // allow cross-origin resource loading for them.
        policy: 'cross-origin',
      },
    }),
  );
  app.setGlobalPrefix('v1');

  const uploadsDir =
    process.env.FILE_UPLOAD_DIR && !process.env.FILE_UPLOAD_DIR.startsWith('.')
      ? path.resolve(process.env.FILE_UPLOAD_DIR)
      : path.join(process.cwd(), 'uploads');
  app.useStaticAssets
  (uploadsDir, { prefix: '/uploads/' });

  const origins = [
    process.env.CORS_ORIGIN_BUILDER ?? 'http://localhost:5173',
    process.env.CORS_ORIGIN_ADMIN ?? 'http://localhost:5174',
    process.env.CORS_ORIGIN_PUBLIC ?? 'http://localhost:3000',
    'http://10.123.173.113:3000'
  ];
  app.enableCors({ origin: origins, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const swagger = new DocumentBuilder()
    .setTitle('VerifiedProps API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(Number(port));
}
void bootstrap();
