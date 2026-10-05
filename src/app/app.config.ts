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
import { LanguageService } from './shared/application/language.service';
import { AccountRepository } from './iam/domain/repositories/account.repository';
import { BrowserAccountRepository } from './iam/infrastructure/browser-account.repository';
import { BusinessRepository } from './businesses/domain/repositories/business.repository';
import { BrowserBusinessRepository } from './businesses/infrastructure/browser-business.repository';
import { OfferRepository } from './offers/domain/repositories/offer.repository';
import { BrowserOfferRepository } from './offers/infrastructure/browser-offer.repository';
import { ReservationRepository } from './reservations/domain/repositories/reservation.repository';
import { BrowserReservationRepository } from './reservations/infrastructure/browser-reservation.repository';
import { NotificationRepository } from './notifications/domain/repositories/notification.repository';
import { BrowserNotificationRepository } from './notifications/infrastructure/browser-notification.repository';
import { FeedbackRepository } from './feedback/domain/repositories/feedback.repository';
import { BrowserFeedbackRepository } from './feedback/infrastructure/browser-feedback.repository';
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
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
    }),
    provideAppInitializer(() => inject(LanguageService).initialize()),
    { provide: AccountRepository, useClass: BrowserAccountRepository },
    { provide: BusinessRepository, useClass: BrowserBusinessRepository },
    { provide: OfferRepository, useClass: BrowserOfferRepository },
    { provide: ReservationRepository, useClass: BrowserReservationRepository },
    { provide: NotificationRepository, useClass: BrowserNotificationRepository },
    { provide: FeedbackRepository, useClass: BrowserFeedbackRepository },
  ],
};
