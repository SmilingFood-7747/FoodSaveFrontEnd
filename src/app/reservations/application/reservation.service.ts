import { computed, inject, Injectable } from '@angular/core';
import { BillingService } from '../../billing/application/billing.service';
import { Offer } from '../../offers/domain/model/offer';
import { OfferService } from '../../offers/application/offer.service';
import { BusinessService } from '../../businesses/application/business.service';
import { SessionService } from '../../iam/application/session.service';
import { ClockService } from '../../shared/application/clock.service';
import { DomainError } from '../../shared/domain/model/domain-error';
import { Reservation, ReservationData } from '../domain/model/reservation';
import { ReservationRepository } from '../domain/repositories/reservation.repository';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly billing = inject(BillingService);
  private readonly repository = inject(ReservationRepository);
  private readonly offers = inject(OfferService);
  private readonly businesses = inject(BusinessService);
  private readonly session = inject(SessionService);
  private readonly clock = inject(ClockService);

  readonly all = computed(() => {
    this.clock.now();
    return this.repository.all().map((reservation) => ({
      ...reservation,
      status: new Reservation(reservation).status,
    }));
  });

  readonly mine = computed(() =>
    this.all().filter((reservation) => reservation.customerUserId === this.session.user()?.id),
  );

  readonly businessReservations = computed(() => {
    const businessIds = new Set(this.businesses.owned().map((business) => business.id));
    return this.all().filter(
      (reservation) => businessIds.has(reservation.businessId ?? this.offers.get(reservation.offerId)?.businessId ?? 0),
    );
  });

  async create(offerId: number, quantity: number): Promise<ReservationData> {
    this.session.require('CUSTOMER');
    const token = this.session.accessToken;
    const offer = this.offers.get(offerId);
    if (!token) throw new DomainError('errors.signIn');
    if (!offer) throw new DomainError('errors.unavailable');
    if (!this.billing.canReserveOffer(offer)) throw new DomainError('errors.plusRequired');
    new Offer(offer).allocate(quantity);
    return this.repository.create(offerId, quantity, token);
  }

  async cancel(id: number): Promise<void> {
    this.session.require('CUSTOMER');
    const token = this.session.accessToken;
    const reservation = this.mine().find((item) => item.id === id);
    if (!reservation) throw new DomainError('errors.forbidden');
    if (!token) throw new DomainError('errors.signIn');
    new Reservation(reservation).cancel();
    await this.repository.cancel(id, token);
  }

  async confirmPickup(code: string): Promise<ReservationData> {
    this.session.require('BUSINESS_OWNER');
    const token = this.session.accessToken;
    const normalized = code.trim().toUpperCase();
    const reservation = this.businessReservations().find(
      (item) => item.pickupCode.toUpperCase() === normalized,
    );
    if (!reservation) throw new DomainError('errors.invalidCode');
    if (!token) throw new DomainError('errors.signIn');
    new Reservation(reservation).collect();
    return this.repository.confirm(reservation.id, normalized, token);
  }
}
