import { computed, inject, Injectable, signal } from '@angular/core';
import { BrowserDatabase } from '../../shared/infrastructure/browser-database';
import { BillingService } from '../../billing/application/billing.service';
import { ClockService } from '../../shared/application/clock.service';
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly db = inject(BrowserDatabase);
  private readonly billing = inject(BillingService);
  private readonly clock = inject(ClockService);
  readonly period = signal(30);
  readonly query = signal('');
  readonly planFilter = signal('ALL');
  readonly summary = computed(() => this.billing.financials(this.period()));
  readonly businesses = computed(() =>
    this.db
      .state()
      .businesses.map((b) => ({
        business: b,
        owner: this.db.state().accounts.find((a) => a.id === b.ownerAccountId),
        plan: this.billing.businessPlan(b.id),
        report: this.billing.businessReport(b.id, this.period()),
      })),
  );
  readonly results = computed(() =>
    this.businesses().filter(
      (row) =>
        `${row.business.name} ${row.owner?.email ?? ''} ${row.business.district}`
          .toLowerCase()
          .includes(this.query().trim().toLowerCase()) &&
        (this.planFilter() === 'ALL' || row.plan.id === this.planFilter()),
    ),
  );
  readonly subscriptions = computed(() =>
    this.db
      .state()
      .subscriptions.filter(
        (s) => s.planId !== 'FREE' && s.expiresAt && Date.parse(s.expiresAt) > this.clock.now(),
      )
      .map((s) => ({
        ...s,
        account: this.db.state().accounts.find((a) => a.id === s.accountId),
        plan: this.billing.planFor(s.accountId),
      })),
  );
  readonly monthlyRevenue = computed(() =>
    this.subscriptions().reduce((sum, s) => sum + s.plan.monthlyPrice, 0),
  );
  readonly charges = computed(() =>
    this.summary()
      .charges.map((c) => ({
        ...c,
        account: this.db.state().accounts.find((a) => a.id === c.accountId),
      }))
      .sort((a, b) => b.id - a.id),
  );
}
