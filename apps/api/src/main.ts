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

  // Each CORS_ORIGIN_* var may hold a single origin (the canonical values are
  // also used by mail templates), while CORS_ORIGINS_EXTRA accepts a
  // comma-separated list for additional origins (e.g. the apex www-less domain).
  const splitOrigins = (value?: string): string[] =>
    (value ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

  const origins = [
    ...splitOrigins(process.env.CORS_ORIGIN_BUILDER),
    ...splitOrigins(process.env.CORS_ORIGIN_ADMIN),
    ...splitOrigins(process.env.CORS_ORIGIN_PUBLIC),
    ...splitOrigins(process.env.CORS_ORIGINS_EXTRA),
  ];
  app.enableCors({
    origin: origins.length > 0 ? origins : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  // Let Nest catch SIGTERM/SIGINT (sent by `docker stop`) and run each
  // module's onModuleDestroy/beforeApplicationShutdown hooks (e.g. Prisma's
  // $disconnect) before the process exits, instead of being killed mid-request.
  app.enableShutdownHooks();

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
