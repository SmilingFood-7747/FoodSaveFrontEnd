import { BillingService } from '../../billing/application/billing.service';
import { computed, inject, Injectable } from '@angular/core';
import { Offer, OfferData } from '../domain/model/offer';
import { OfferRepository } from '../domain/repositories/offer.repository';
import { BusinessService } from '../../businesses/application/business.service';
import { SessionService } from '../../iam/application/session.service';
import { ApiDatabase } from '../../shared/infrastructure/api-database';
import { ClockService } from '../../shared/application/clock.service';
import { DomainError } from '../../shared/domain/model/domain-error';
@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly billing = inject(BillingService);
  private readonly repository = inject(OfferRepository);
  private readonly businesses = inject(BusinessService);
  private readonly session = inject(SessionService);
  private readonly db = inject(ApiDatabase);
  private readonly clock = inject(ClockService);
  readonly all = computed(() => {
    this.clock.now();
    return this.repository.all().map((data) => ({ ...data, status: new Offer(data).status }));
  });
  readonly active = computed(() =>
    this.all().filter((o) => o.status === 'ACTIVE' && this.businesses.get(o.businessId)?.isActive),
  );
  readonly owned = computed(() =>
    this.all().filter((o) => this.businesses.owned().some((b) => b.id === o.businessId)),
  );
  get(id: number): OfferData | undefined {
    return this.all().find((o) => o.id === id);
  }
  async save(
    data: Omit<OfferData, 'id' | 'availableUnits' | 'status'>,
    id?: number,
  ): Promise<OfferData> {
    const owner = this.session.require('BUSINESS_OWNER');
    if (this.businesses.get(data.businessId)?.ownerAccountId !== owner.id)
      throw new DomainError('errors.forbidden');
    const current = id ? this.get(id) : undefined;
    if (id && (!current || this.businesses.get(current.businessId)?.ownerAccountId !== owner.id))
      throw new DomainError('errors.forbidden');
    if (
      current &&
      this.db.state().reservations.some((r) => r.offerId === current.id && r.status === 'ACTIVE')
    )
      throw new DomainError('errors.offerReserved');
    if (data.plusExclusive && !this.businesses.get(data.businessId)?.plusPartner)
      throw new DomainError('errors.plusPartnerRequired');
    const next = {
      ...data,
      id: id ?? this.db.nextId(this.all()),
      availableUnits: data.initialUnits,
      status: 'ACTIVE' as const,
    };
    Offer.validate(next);
    this.billing.assertCanPublish(data.businessId, id);
    await this.repository.save(next);
    return next;
  }
  async pause(id: number): Promise<void> {
    const owner = this.session.require('BUSINESS_OWNER');
    const current = this.get(id);
    if (!current || this.businesses.get(current.businessId)?.ownerAccountId !== owner.id)
      throw new DomainError('errors.forbidden');
    await this.db.commit((s) => {
      const affected = s.reservations.filter((r) => r.offerId === id && r.status === 'ACTIVE');
      const messages = affected.map((r, index) => ({
        id: this.db.nextId(s.notifications) + index,
        recipientAccountId: r.customerUserId,
        reservationId: r.id,
        type: 'OFFER_CHANGED' as const,
        titleKey: 'notice.offerChanged',
        body: current.title,
        createdAt: new Date().toISOString(),
      }));
      return {
        ...s,
        offers: s.offers.map((o) => (o.id === id ? { ...o, status: 'PAUSED' as const } : o)),
        notifications: [...s.notifications, ...messages],
      };
    });
  }
}
