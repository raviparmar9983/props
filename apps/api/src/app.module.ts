import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { AuthModule } from './features/auth/auth.module';
import { BuildersModule } from './features/builders/builders.module';
import { AdminModule } from './features/admin/admin.module';
import { ProjectsModule } from './features/projects/projects.module';
import { TowersModule } from './features/towers/towers.module';
import { UnitTypesModule } from './features/unit-types/unit-types.module';
import { MediaModule } from './features/media/media.module';
import { ContactsModule } from './features/contacts/contacts.module';
import { LeadsModule } from './features/leads/leads.module';
import { CitiesModule } from './features/cities/cities.module';
import { AmenitiesModule } from './features/amenities/amenities.module';
import { PublicModule } from './features/public/public.module';
import { SavedPropertiesModule } from './features/saved-properties/saved-properties.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { LandmarksModule } from './features/landmarks/landmarks.module';
import { PriceComponentsModule } from './features/price-components/price-components.module';
import { PaymentPlansModule } from './features/payment-plans/payment-plans.module';
import { BankPartnersModule } from './features/bank-partners/bank-partners.module';
import { ConstructionUpdatesModule } from './features/construction-updates/construction-updates.module';
import { SpecificationsModule } from './features/specifications/specifications.module';
import { FaqsModule } from './features/faqs/faqs.module';
import { SiteVisitsModule } from './features/site-visits/site-visits.module';
import { ProjectHighlightsModule } from './features/project-highlights/project-highlights.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL ?? '60') * 1000,
      limit: parseInt(process.env.THROTTLE_LIMIT ?? '120'),
    }]),
    PrismaModule,
    MailModule,
    StorageModule,
    AuthModule,
    BuildersModule,
    AdminModule,
    ProjectsModule,
    TowersModule,
    UnitTypesModule,
    MediaModule,
    ContactsModule,
    LeadsModule,
    CitiesModule,
    AmenitiesModule,
    PublicModule,
    SavedPropertiesModule,
    NotificationsModule,
    LandmarksModule,
    PriceComponentsModule,
    PaymentPlansModule,
    BankPartnersModule,
    ConstructionUpdatesModule,
    SpecificationsModule,
    FaqsModule,
    SiteVisitsModule,
    ProjectHighlightsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
