import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling, withComponentInputBinding } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { ApiDatabase } from './shared/infrastructure/api-database';
import { LanguageService } from './shared/application/language.service';
import { AccountRepository } from './iam/domain/repositories/account.repository';
import { ApiAccountRepository } from './iam/infrastructure/api-account.repository';
import { BusinessRepository } from './businesses/domain/repositories/business.repository';
import { ApiBusinessRepository } from './businesses/infrastructure/api-business.repository';
import { OfferRepository } from './offers/domain/repositories/offer.repository';
import { ApiOfferRepository } from './offers/infrastructure/api-offer.repository';
import { ReservationRepository } from './reservations/domain/repositories/reservation.repository';
import { ApiReservationRepository } from './reservations/infrastructure/api-reservation.repository';
import { NotificationRepository } from './notifications/domain/repositories/notification.repository';
import { ApiNotificationRepository } from './notifications/infrastructure/api-notification.repository';
import { FeedbackRepository } from './feedback/domain/repositories/feedback.repository';
import { ApiFeedbackRepository } from './feedback/infrastructure/api-feedback.repository';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withXhr()),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      withComponentInputBinding(),
    ),
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json',
        enforceLoading: true,
      }),
    }),
    provideAppInitializer(() => inject(LanguageService).initialize()),
    provideAppInitializer(() => inject(ApiDatabase).initialize()),
    { provide: AccountRepository, useClass: ApiAccountRepository },
    { provide: BusinessRepository, useClass: ApiBusinessRepository },
    { provide: OfferRepository, useClass: ApiOfferRepository },
    { provide: ReservationRepository, useClass: ApiReservationRepository },
    { provide: NotificationRepository, useClass: ApiNotificationRepository },
    { provide: FeedbackRepository, useClass: ApiFeedbackRepository },
  ],
};
