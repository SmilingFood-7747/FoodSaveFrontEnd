import { computed, inject, Injectable } from '@angular/core';
import { ApiDatabase, upsert } from '../../shared/infrastructure/api-database';
import { SessionService } from '../../iam/application/session.service';
import { ClockService } from '../../shared/application/clock.service';
import { DomainError } from '../../shared/domain/model/domain-error';
import { Offer, OfferData } from '../../offers/domain/model/offer';
import {
  cents,
  money,
  monthlyEnd,
  PlanAudience,
  PlanId,
  PLANS,
  Subscription,
} from '../domain/model/subscription';
@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly db = inject(ApiDatabase);
  private readonly session = inject(SessionService);
  private readonly clock = inject(ClockService);
  readonly current = computed(() => this.subscriptionFor(this.session.user()?.id ?? 0));
  readonly currentPlan = computed(() => this.planFor(this.session.user()?.id ?? 0));
  readonly charges = computed(() =>
    this.db
      .state()
      .subscriptionCharges.filter((c) => c.accountId === this.session.user()?.id)
      .sort((a, b) => b.id - a.id),
  );
  subscriptionFor(accountId: number): Subscription | undefined {
    const subscription = this.db.state().subscriptions.find((s) => s.accountId === accountId);
    if (!subscription) return undefined;
    if (
      subscription.expiresAt &&
      Date.parse(subscription.expiresAt) <= Math.max(this.clock.now(), Date.now())
    )
      return undefined;
    return subscription;
  }
  planFor(accountId: number) {
    const audience =
      this.db.state().accounts.find((a) => a.id === accountId)?.role === 'BUSINESS_OWNER'
        ? 'BUSINESS_OWNER'
        : 'CUSTOMER';
    const id = this.subscriptionFor(accountId)?.planId ?? 'FREE';
    return PLANS[audience].find((p) => p.id === id) ?? PLANS[audience][0];
  }
  businessPlan(businessId: number) {
    const owner = this.db.state().businesses.find((b) => b.id === businessId)?.ownerAccountId ?? 0;
    return this.planFor(owner);
  }
  isExclusiveOffer(offer: OfferData): boolean {
    return (
      !!offer.plusExclusive &&
      !!this.db
        .state()
        .businesses.find((business) => business.id === offer.businessId && business.plusPartner)
    );
  }
  canReserveOffer(offer: OfferData, accountId = this.session.user()?.id ?? 0): boolean {
    if (!this.isExclusiveOffer(offer)) return true;
    return (
      this.db
        .state()
        .accounts.some((account) => account.id === accountId && account.role === 'CUSTOMER') &&
      this.planFor(accountId).exclusiveAccess
    );
  }
  async choosePlan(id: PlanId): Promise<'ACTIVE' | 'SCHEDULED'> {
    const account = this.session.require();
    if (account.role !== 'CUSTOMER' && account.role !== 'BUSINESS_OWNER')
      throw new DomainError('errors.forbidden');
    const plan = PLANS[account.role].find((p) => p.id === id);
    if (!plan) throw new DomainError('errors.plan');
    const current = this.subscriptionFor(account.id);
    if (current?.expiresAt) {
      await this.db.commit((s) => ({
        ...s,
        subscriptions: s.subscriptions.map((item) =>
          item.accountId === account.id ? { ...item, nextPlanId: id } : item,
        ),
      }));
      return 'SCHEDULED';
    }
    if (id === 'FREE') return 'ACTIVE';
    await this.activate(account.id, account.role, id, new Date());
    return 'ACTIVE';
  }
  async cancelRenewal(): Promise<void> {
    await this.choosePlan('FREE');
  }
  private async activate(
    accountId: number,
    audience: PlanAudience,
    planId: PlanId,
    start: Date,
  ): Promise<void> {
    const plan = PLANS[audience].find((p) => p.id === planId)!;
    const expiresAt = plan.monthlyPrice ? monthlyEnd(start).toISOString() : null;
    await this.db.commit((s) => {
      const previous = s.subscriptions.find((item) => item.accountId === accountId);
      const subscription: Subscription = {
        id: previous?.id ?? this.db.nextId(s.subscriptions),
        accountId,
        audience,
        planId,
        startsAt: start.toISOString(),
        expiresAt,
      };
      return {
        ...s,
        subscriptions: upsert(s.subscriptions, subscription),
        subscriptionCharges: expiresAt
          ? [
              ...s.subscriptionCharges,
              {
                id: this.db.nextId(s.subscriptionCharges),
                accountId,
                audience,
                planId,
                amount: plan.monthlyPrice,
                createdAt: new Date().toISOString(),
                periodStartAt: start.toISOString(),
                periodEndAt: expiresAt,
                status: 'SIMULATED' as const,
              },
            ]
          : s.subscriptionCharges,
      };
    });
  }
  discountBudget(accountId: number): number {
    const plan = this.planFor(accountId);
    if (!plan.discountRate) return 0;
    const now = Math.max(this.clock.now(), Date.now());
    const charge = [...this.db.state().subscriptionCharges]
      .reverse()
      .find(
        (c) =>
          c.accountId === accountId &&
          Date.parse(c.periodStartAt) <= now &&
          Date.parse(c.periodEndAt) > now,
      );
    if (!charge) return 0;
    const spent = this.db
      .state()
      .reservations.filter(
        (r) =>
          r.customerUserId === accountId &&
          r.discountPeriodStartAt === charge.periodStartAt &&
          (r.status === 'COLLECTED' ||
            (r.status === 'ACTIVE' && Date.parse(r.pickupDeadlineAt) > now)),
      )
      .reduce((sum, r) => sum + cents(r.customerDiscountAmount ?? 0), 0);
    return money(Math.max(0, cents(plan.monthlyDiscountLimit) - spent));
  }
  quote(amount: number, accountId = this.session.user()?.id ?? 0) {
    const validAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
    const total = cents(validAmount);
    const account = this.db.state().accounts.find((a) => a.id === accountId);
    const plan = this.planFor(accountId);
    const discount =
      account?.role === 'CUSTOMER'
        ? Math.min(
            Math.round((total * plan.discountRate) / 100),
            cents(this.discountBudget(accountId)),
          )
        : 0;
    const now = Math.max(this.clock.now(), Date.now());
    const period = [...this.db.state().subscriptionCharges]
      .reverse()
      .find(
        (c) =>
          c.accountId === accountId &&
          Date.parse(c.periodStartAt) <= now &&
          Date.parse(c.periodEndAt) > now,
      );
    return {
      customerDiscountRate: discount ? plan.discountRate : 0,
      customerDiscountAmount: money(discount),
      customerPaidAmount: money(total - discount),
      discountPeriodStartAt: period?.periodStartAt,
    };
  }
  assertCanPublish(businessId: number, offerId?: number): void {
    const limit = this.businessPlan(businessId).activeOfferLimit;
    if (limit === null) return;
    const offers = this.db.state().offers;
    if (
      offerId &&
      offers.some(
        (o) => o.id === offerId && o.businessId === businessId && new Offer(o).status === 'ACTIVE',
      )
    )
      return;
    const active = offers.filter(
      (o) => o.businessId === businessId && new Offer(o).status === 'ACTIVE',
    ).length;
    if (active >= limit) throw new DomainError('errors.offerLimit');
  }
  financials(days: number, businessIds?: number[]) {
    const state = this.db.state();
    const now = Math.max(this.clock.now(), Date.now());
    const start = days ? now - days * 86400000 : -Infinity;
    const rows = state.reservations.filter(
      (r) =>
        r.status === 'COLLECTED' &&
        Date.parse(r.collectedAt ?? r.createdAt) >= start &&
        Date.parse(r.collectedAt ?? r.createdAt) <= now &&
        (!businessIds ||
          businessIds.includes(
            r.businessId ?? state.offers.find((o) => o.id === r.offerId)?.businessId ?? 0,
          )),
    );
    const accountIds = businessIds
      ? new Set(
          state.businesses.filter((b) => businessIds.includes(b.id)).map((b) => b.ownerAccountId),
        )
      : undefined;
    const charges = state.subscriptionCharges.filter(
      (c) =>
        Date.parse(c.createdAt) >= start &&
        Date.parse(c.createdAt) <= now &&
        (!accountIds || accountIds.has(c.accountId)),
    );
    const gross = rows.reduce((sum, r) => sum + cents(r.unitPrice * r.quantity), 0);
    const commission = rows.reduce((sum, r) => sum + cents(r.commissionAmount ?? 0), 0);
    const discounts = rows.reduce((sum, r) => sum + cents(r.customerDiscountAmount ?? 0), 0);
    const subscriptions = charges.reduce((sum, c) => sum + cents(c.amount), 0);
    return {
      rows,
      charges,
      gross: money(gross),
      commission: money(commission),
      discounts: money(discounts),
      subscriptions: money(subscriptions),
      businessNet: money(gross - commission),
      platformIncome: money(commission + subscriptions),
      platformBalance: money(commission + subscriptions - discounts),
    };
  }
  businessReport(businessId: number, days: number) {
    const business = this.db.state().businesses.find((b) => b.id === businessId);
    const report = this.financials(days, [businessId]);
    const ownerBusinesses = this.db
      .state()
      .businesses.filter((b) => b.ownerAccountId === business?.ownerAccountId);
    return {
      ...report,
      subscriptions: ownerBusinesses.length === 1 ? report.subscriptions : 0,
      subscriptionShared: ownerBusinesses.length > 1,
    };
  }
}
