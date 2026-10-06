import { BillingService } from '../../billing/application/billing.service';
import { cents, money } from '../../billing/domain/model/subscription';
import { computed, effect, inject, Injectable } from '@angular/core';
import { Notification } from '../../notifications/domain/model/notification';
import { Reservation, ReservationData } from '../domain/model/reservation';
import { ReservationRepository } from '../domain/repositories/reservation.repository';
import { Offer } from '../../offers/domain/model/offer';
import { OfferService } from '../../offers/application/offer.service';
import { BusinessService } from '../../businesses/application/business.service';
import { SessionService } from '../../iam/application/session.service';
import { BrowserDatabase, upsert } from '../../shared/infrastructure/browser-database';
import { ClockService } from '../../shared/application/clock.service';
import { DomainError } from '../../shared/domain/model/domain-error';
@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly billing = inject(BillingService);
  private readonly repository = inject(ReservationRepository);
  private readonly offers = inject(OfferService);
  private readonly businesses = inject(BusinessService);
  private readonly session = inject(SessionService);
  private readonly db = inject(BrowserDatabase);
  private readonly clock = inject(ClockService);
  readonly all = computed(() => {
    this.clock.now();
    return this.repository.all().map((r) => ({ ...r, status: new Reservation(r).status }));
  });
  readonly mine = computed(() =>
    this.all().filter((r) => r.customerUserId === this.session.user()?.id),
  );
  readonly businessReservations = computed(() =>
    this.all().filter((r) =>
      this.businesses.owned().some((b) => b.id === this.offers.get(r.offerId)?.businessId),
    ),
  );
  constructor() {
    effect(() => {
      const now = this.clock.now();
      const expired = this.db
        .state()
        .reservations.filter((r) => r.status === 'ACTIVE' && Date.parse(r.pickupDeadlineAt) <= now);
      if (!expired.length) return;
      this.db.commit((s) => {
        for (const reservation of expired) {
          const current = s.reservations.find((r) => r.id === reservation.id);
          if (!current || current.status !== 'ACTIVE') continue;
          current.status = 'EXPIRED';
          const offer = s.offers.find((o) => o.id === current.offerId);
          if (offer) s.offers = upsert(s.offers, new Offer(offer).release(current.quantity));
        }
        return s;
      });
    });
  }
  create(offerId: number, quantity: number): ReservationData {
    const customer = this.session.require('CUSTOMER');
    let created!: ReservationData;
    this.db.commit((s) => {
      const data = s.offers.find((o) => o.id === offerId);
      if (!data) throw new DomainError('errors.unavailable');
      const allocated = new Offer(data).allocate(quantity);
      let code = '';
      do {
        code = 'FS-' + crypto.randomUUID().slice(0, 8).toUpperCase();
      } while (s.reservations.some((r) => r.pickupCode === code));
      created = {
        id: this.db.nextId(s.reservations),
        offerId,
        businessId: data.businessId,
        commissionRate: this.billing.businessPlan(data.businessId).commissionRate,
        commissionAmount: money(
          Math.round(
            (cents(data.offerPrice * quantity) *
              this.billing.businessPlan(data.businessId).commissionRate) /
              100,
          ),
        ),
        ...this.billing.quote(data.offerPrice * quantity, customer.id),
        customerUserId: customer.id,
        quantity,
        unitPrice: data.offerPrice,
        originalUnitPrice: data.originalPrice,
        pickupCode: code,
        pickupStartAt: data.pickupStartAt,
        pickupDeadlineAt: data.pickupEndAt,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      const ownerId = this.businesses.get(data.businessId)?.ownerAccountId;
      const messages: Notification[] = [
        {
          id: this.db.nextId(s.notifications),
          recipientAccountId: customer.id,
          reservationId: created.id,
          type: 'RESERVATION_CONFIRMED',
          titleKey: 'notice.confirmed',
          body: `${data.title} · ${code}`,
          createdAt: created.createdAt,
        },
      ];
      if (ownerId)
        messages.push({
          id: messages[0].id + 1,
          recipientAccountId: ownerId,
          reservationId: created.id,
          type: 'NEW_RESERVATION',
          titleKey: 'notice.newReservation',
          body: `${data.title} · ${quantity}`,
          createdAt: created.createdAt,
        });
      return {
        ...s,
        offers: upsert(s.offers, allocated),
        reservations: [...s.reservations, created],
        notifications: [...s.notifications, ...messages],
      };
    });
    return created;
  }
  cancel(id: number): void {
    const customer = this.session.require('CUSTOMER');
    this.db.commit((s) => {
      const data = s.reservations.find((r) => r.id === id && r.customerUserId === customer.id);
      if (!data) throw new DomainError('errors.forbidden');
      const next = new Reservation(data).cancel();
      const offer = s.offers.find((o) => o.id === data.offerId);
      const ownerId = offer && this.businesses.get(offer.businessId)?.ownerAccountId;
      const notice: Notification[] = ownerId
        ? [
            {
              id: this.db.nextId(s.notifications),
              recipientAccountId: ownerId,
              reservationId: id,
              type: 'RESERVATION_CANCELLED',
              titleKey: 'notice.cancelled',
              body: `${offer?.title} · ${data.quantity}`,
              createdAt: new Date().toISOString(),
            },
          ]
        : [];
      return {
        ...s,
        reservations: upsert(s.reservations, next),
        offers: offer ? upsert(s.offers, new Offer(offer).release(data.quantity)) : s.offers,
        notifications: [...s.notifications, ...notice],
      };
    });
  }
  confirmPickup(code: string): ReservationData {
    this.session.require('BUSINESS_OWNER');
    const normalized = code.trim().toUpperCase();
    const data = this.businessReservations().find((r) => r.pickupCode === normalized);
    if (!data) throw new DomainError('errors.invalidCode');
    const collected = new Reservation(data).collect();
    this.repository.save(collected);
    return collected;
  }
}
