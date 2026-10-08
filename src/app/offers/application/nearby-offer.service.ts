import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { OfferService } from './offer.service';
import { BusinessService } from '../../businesses/application/business.service';
import { GeolocationService } from '../../shared/application/geolocation.service';
import { SessionService } from '../../iam/application/session.service';
import { NotificationService } from '../../notifications/application/notification.service';
import { BillingService } from '../../billing/application/billing.service';
import { OfferData } from '../domain/model/offer';
export interface NearbyOffer {
  offer: OfferData;
  businessName: string;
  distanceKm: number;
}
@Injectable({ providedIn: 'root' })
export class NearbyOfferService {
  private readonly offers = inject(OfferService);
  private readonly businesses = inject(BusinessService);
  readonly geo = inject(GeolocationService);
  private readonly session = inject(SessionService);
  private readonly notifications = inject(NotificationService);
  readonly billing = inject(BillingService);
  readonly radiusKm = 2;
  private readonly seen = new Set<string>(this.restoreSeen());
  private readonly dismissed = signal<string[]>([]);
  private readonly toastKey = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;
  private accountKey: string | undefined;
  readonly nearby = computed<NearbyOffer[]>(() => {
    if (
      !this.geo.position() ||
      this.session.isBusinessOwner() ||
      this.session.isAdmin() ||
      this.notifications.preferences().nearbyOffersEnabled === false
    )
      return [];
    return this.offers
      .active()
      .flatMap((offer) => {
        const business = this.businesses.get(offer.businessId);
        if (!business || offer.availableUnits < 1) return [];
        const distance = this.geo.distance(business.latitude, business.longitude);
        return distance !== null && distance <= this.radiusKm
          ? [{ offer, businessName: business.name, distanceKm: distance }]
          : [];
      })
      .sort((a, b) => a.distanceKm - b.distanceKm || a.offer.id - b.offer.id);
  });
  readonly pinned = computed(() =>
    this.nearby().find((item) => !this.dismissed().includes(this.key(item))),
  );
  readonly toast = computed(() => this.nearby().find((item) => this.key(item) === this.toastKey()));
  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
    void this.geo.resumeIfGranted();
    effect(() => {
      const user = this.session.user();
      const accountKey = String(user?.id ?? 'guest');
      const nearby = this.nearby();
      const notices = this.notifications.mine();
      if (this.accountKey !== accountKey) {
        this.accountKey = accountKey;
        untracked(() => {
          this.dismissed.set([]);
          this.dismissToast();
        });
      }
      const fresh = nearby.filter(
        (item) =>
          !this.seen.has(this.key(item)) &&
          !notices.some(
            (notice) =>
              notice.type === 'NEARBY_OFFER' &&
              notice.offerId === item.offer.id &&
              notice.offerVersion === item.offer.pickupEndAt,
          ),
      );
      if (!fresh.length) return;
      untracked(() => {
        for (const item of fresh) this.seen.add(this.key(item));
        this.saveSeen();
        this.notifications.recordNearby(
          fresh.map((item) => ({
            offerId: item.offer.id,
            distanceKm: Math.round(item.distanceKm * 10) / 10,
            offerVersion: item.offer.pickupEndAt,
            body: `${item.offer.title} · ${item.businessName}`,
          })),
        );
        this.toastKey.set(this.key(fresh[0]));
        this.restartTimer();
      });
    });
  }
  private key(item: NearbyOffer): string {
    return `${this.session.user()?.id ?? 'guest'}:${item.offer.id}:${item.offer.pickupEndAt}`;
  }
  dismissPinned(): void {
    const pinned = this.pinned();
    if (pinned)
      this.dismissed.update((items) => [...items, ...this.nearby().map((item) => this.key(item))]);
  }
  dismissToast(): void {
    clearTimeout(this.timer);
    this.toastKey.set(null);
  }
  pauseTimer(): void {
    clearTimeout(this.timer);
  }
  restartTimer(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.toastKey.set(null), 6000);
  }
  private restoreSeen(): string[] {
    try {
      const value: unknown = JSON.parse(sessionStorage.getItem('foodsave-nearby-seen') ?? '[]');
      return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string').slice(-200)
        : [];
    } catch {
      return [];
    }
  }
  private saveSeen(): void {
    try {
      sessionStorage.setItem('foodsave-nearby-seen', JSON.stringify([...this.seen].slice(-200)));
    } catch {}
  }
}
