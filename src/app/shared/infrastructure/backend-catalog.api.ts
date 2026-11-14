import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, forkJoin, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Business } from '../../businesses/domain/model/business';
import { Session } from '../../iam/domain/model/account';
import { OfferData } from '../../offers/domain/model/offer';
import { ReservationData } from '../../reservations/domain/model/reservation';
import { Notification, NotificationPreferences } from '../../notifications/domain/model/notification';
import { ApiDatabase } from './api-database';
import { Review, SupportRequest } from '../../feedback/domain/model/review';

@Injectable({ providedIn: 'root' })
export class BackendCatalogApi {
  private readonly http = inject(HttpClient);
  private readonly database = inject(ApiDatabase);
  private readonly baseUrl = environment.foodsaveBackendBaseUrl.replace(/\/$/, '');
  readonly error = signal('');
  readonly businesses = signal<Business[]>([]);
  readonly offers = signal<OfferData[]>([]);
  readonly reservations = signal<ReservationData[]>([]);
  readonly notifications = signal<Notification[]>([]);
  readonly preferences = signal<NotificationPreferences | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly requests = signal<SupportRequest[]>([]);
  private currentSession: Session | null = null;
  private currentToken: string | null = null;

  async initialize(session: Session | null, token: string | null): Promise<void> {
    await this.refresh(session, token);
  }

  async refresh(session: Session | null, token: string | null): Promise<void> {
    this.currentSession = session;
    this.currentToken = token;
    try {
      const publicData = await firstValueFrom(forkJoin({
        businesses: this.http.get<Business[]>(`${this.baseUrl}/api/v1/businesses`).pipe(timeout(60000)),
        offers: this.http.get<OfferData[]>(`${this.baseUrl}/api/v1/offers`).pipe(timeout(60000)),
      }));
      let businesses = publicData.businesses;
      let reservations: ReservationData[] = [];
      let notifications: Notification[] = [];
      let reviews: Review[] = [];
      let requests: SupportRequest[] = [];
      let preferences: NotificationPreferences | undefined;
      if (session && token) {
        const accountData = await firstValueFrom(forkJoin({
          notifications: this.http.get<Notification[]>(`${this.baseUrl}/api/v1/notifications`, {
            headers: this.headers(token),
          }).pipe(timeout(60000)),
          preferences: this.http.get<NotificationPreferences>(`${this.baseUrl}/api/v1/notifications/preferences`, {
            headers: this.headers(token),
          }).pipe(timeout(60000)),
          requests: this.http.get<SupportRequest[]>(`${this.baseUrl}/api/v1/feedback/requests`, {
            headers: this.headers(token),
          }).pipe(timeout(60000)),
          reviews: this.http.get<Review[]>(`${this.baseUrl}/api/v1/feedback/reviews`, {
            headers: this.headers(token),
          }).pipe(timeout(60000)),
        }));
        notifications = accountData.notifications;
        preferences = accountData.preferences;
        requests = accountData.requests;
        reviews = accountData.reviews;
      }
      if (session?.role === 'BUSINESS_OWNER' && token) {
        const owned = await firstValueFrom(this.http.get<Business[]>(`${this.baseUrl}/api/v1/businesses/mine`, {
          headers: this.headers(token),
        }).pipe(timeout(60000)));
        businesses = [...new Map([...businesses, ...owned].map((business) => [business.id, business])).values()];
        const rows = await Promise.all(owned.map((business) =>
          firstValueFrom(this.http.get<ReservationData[]>(`${this.baseUrl}/api/v1/reservations/business/${business.id}`, {
            headers: this.headers(token),
          }).pipe(timeout(60000))),
        ));
        reservations = rows.flat();
      } else if (session?.role === 'CUSTOMER' && token) {
        reservations = await firstValueFrom(this.http.get<ReservationData[]>(`${this.baseUrl}/api/v1/reservations`, {
          headers: this.headers(token),
        }).pipe(timeout(60000)));
      }
      this.reservations.set(reservations);
      this.notifications.set(notifications);
      this.preferences.set(preferences ?? null);
      this.reviews.set(reviews);
      this.requests.set(requests);
      this.setCatalog(
        businesses, publicData.offers, session, reservations, notifications, preferences,
        reviews, requests,
      );
      this.error.set('');
    } catch (error) {
      this.error.set(this.errorCode(error));
    }
  }

  async saveBusiness(business: Business, token: string): Promise<Business> {
    const body = {
      name: business.name,
      address: business.address,
      district: business.district,
      latitude: business.latitude,
      longitude: business.longitude,
      contactPhone: business.contactPhone,
      pickupConditions: business.pickupConditions,
    };
    const saved = await firstValueFrom(business.id
      ? this.http.put<Business>(`${this.baseUrl}/api/v1/businesses/${business.id}/profile`, body, { headers: this.headers(token) })
      : this.http.post<Business>(`${this.baseUrl}/api/v1/businesses`, body, { headers: this.headers(token) }));
    const businesses = [...this.businesses().filter((item) => item.id !== saved.id), saved];
    this.setCatalog(businesses, this.offers());
    return saved;
  }

  async saveOffer(offer: OfferData, token: string): Promise<OfferData> {
    const body = {
      businessId: offer.businessId,
      category: offer.category,
      title: offer.title,
      description: offer.description,
      allergens: offer.allergens,
      originalPrice: offer.originalPrice,
      offerPrice: offer.offerPrice,
      initialUnits: offer.initialUnits,
      pickupStartAt: offer.pickupStartAt,
      pickupEndAt: offer.pickupEndAt,
      expiresAt: offer.expiresAt,
      image: offer.image,
      plusExclusive: !!offer.plusExclusive,
    };
    const saved = await firstValueFrom(offer.id
      ? this.http.put<OfferData>(`${this.baseUrl}/api/v1/offers/${offer.id}`, body, { headers: this.headers(token) })
      : this.http.post<OfferData>(`${this.baseUrl}/api/v1/offers`, body, { headers: this.headers(token) }));
    this.setCatalog(this.businesses(), [...this.offers().filter((item) => item.id !== saved.id), saved]);
    return saved;
  }

  async pauseOffer(id: number, token: string): Promise<OfferData> {
    const paused = await firstValueFrom(this.http.patch<OfferData>(
      `${this.baseUrl}/api/v1/offers/${id}/pause`, {}, { headers: this.headers(token) },
    ));
    this.setCatalog(this.businesses(), [...this.offers().filter((item) => item.id !== paused.id), paused]);
    return paused;
  }

  async createReservation(offerId: number, quantity: number, token: string): Promise<ReservationData> {
    const reservation = await firstValueFrom(this.http.post<ReservationData>(
      `${this.baseUrl}/api/v1/reservations`, { offerId, quantity }, { headers: this.headers(token) },
    ));
    await this.refreshFromCurrent(reservation, token);
    return reservation;
  }

  async cancelReservation(id: number, token: string): Promise<void> {
    await firstValueFrom(this.http.patch<ReservationData>(
      `${this.baseUrl}/api/v1/reservations/${id}/cancel`, {}, { headers: this.headers(token) },
    ));
    await this.refreshFromCurrent(undefined, token);
  }

  async confirmReservation(id: number, code: string, token: string): Promise<ReservationData> {
    const reservation = await firstValueFrom(this.http.patch<ReservationData>(
      `${this.baseUrl}/api/v1/reservations/${id}/confirm`, { code }, { headers: this.headers(token) },
    ));
    await this.refreshFromCurrent(reservation, token);
    return reservation;
  }

  async markNotificationRead(id: number, token: string): Promise<void> {
    await firstValueFrom(this.http.patch<void>(
      `${this.baseUrl}/api/v1/notifications/${id}/read`, {}, { headers: this.headers(token) },
    ));
    const notifications = this.notifications().map((item) =>
      item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
    );
    this.notifications.set(notifications);
    this.setCatalog(this.businesses(), this.offers(), this.currentSession, this.reservations(), notifications, this.preferences() ?? undefined);
  }

  async savePreferences(preferences: NotificationPreferences, token: string): Promise<void> {
    const saved = await firstValueFrom(this.http.put<NotificationPreferences>(
      `${this.baseUrl}/api/v1/notifications/preferences`, preferences, { headers: this.headers(token) },
    ));
    this.preferences.set(saved);
    this.setCatalog(this.businesses(), this.offers(), this.currentSession, this.reservations(), this.notifications(), saved);
  }

  async submitReview(
    reservationId: number,
    rating: number,
    comment: string,
    token: string,
  ): Promise<void> {
    const review = await firstValueFrom(this.http.post<Review>(
      `${this.baseUrl}/api/v1/feedback/reviews`, { reservationId, rating, comment },
      { headers: this.headers(token) },
    ));
    const reviews = [...this.reviews().filter((item) => item.id !== review.id), review];
    this.reviews.set(reviews);
    this.setCatalog(
      this.businesses(), this.offers(), this.currentSession, this.reservations(),
      this.notifications(), this.preferences() ?? undefined, reviews, this.requests(),
    );
  }

  async openSupportRequest(
    subject: string,
    description: string,
    reservationId: number | undefined,
    token: string,
  ): Promise<void> {
    const request = await firstValueFrom(this.http.post<SupportRequest>(
      `${this.baseUrl}/api/v1/feedback/requests`, { subject, description, reservationId },
      { headers: this.headers(token) },
    ));
    const requests = [...this.requests(), request];
    this.requests.set(requests);
    this.setCatalog(
      this.businesses(), this.offers(), this.currentSession, this.reservations(),
      this.notifications(), this.preferences() ?? undefined, this.reviews(), requests,
    );
  }

  private async refreshFromCurrent(
    reservation: ReservationData | undefined,
    token: string,
  ): Promise<void> {
    if (reservation) {
      const reservations = [...this.reservations().filter((item) => item.id !== reservation.id), reservation];
      this.reservations.set(reservations);
    }
    await this.refresh(this.currentSession, this.currentToken ?? token);
  }

  private setCatalog(
    businesses: Business[],
    offers: OfferData[],
    session?: Session | null,
    reservations?: ReservationData[],
    notifications?: Notification[],
    preferences?: NotificationPreferences,
    reviews?: Review[],
    requests?: SupportRequest[],
  ): void {
    this.businesses.set(businesses);
    this.offers.set(offers);
    this.database.replaceBackendCatalog(
      businesses, offers, session ?? undefined, reservations, notifications, preferences,
      reviews, requests,
    );
  }

  private headers(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private errorCode(error: unknown): string {
    if (!(error instanceof HttpErrorResponse) || error.status === 0 || error.status >= 500)
      return 'errors.backendUnavailable';
    if (error.status === 401) return 'errors.signIn';
    if (error.status === 403) return 'errors.forbidden';
    return 'errors.generic';
  }
}
