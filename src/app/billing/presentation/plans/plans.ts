import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { UI } from '../../../shared/presentation/ui';
import { SessionService } from '../../../iam/application/session.service';
import { BillingService } from '../../application/billing.service';
import {
  cents,
  money,
  PlanAudience,
  PLANS,
  SubscriptionPlan,
} from '../../domain/model/subscription';
@Component({
  selector: 'app-plans',
  imports: UI,
  templateUrl: './plans.html',
  styleUrl: './plans.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Plans {
  readonly busy = signal(false);
  readonly session = inject(SessionService);
  readonly billing = inject(BillingService);
  readonly audience = signal<PlanAudience>(
    this.session.isBusinessOwner() ? 'BUSINESS_OWNER' : 'CUSTOMER',
  );
  readonly plans = computed(() => PLANS[this.audience()]);
  readonly ownAudience = computed(() => this.session.user()?.role === this.audience());
  readonly pending = signal<SubscriptionPlan | null>(null);
  readonly accepted = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly monthlySpend = signal(250);
  readonly remaining = computed(() => this.billing.discountBudget(this.session.user()?.id ?? 0));
  selectAudience(value: PlanAudience): void {
    this.audience.set(value);
    this.pending.set(null);
    this.error.set('');
  }
  select(plan: SubscriptionPlan): void {
    this.pending.set(plan);
    this.accepted.set(false);
    this.error.set('');
    this.message.set('');
  }
  async confirm(): Promise<void> {
    if (this.busy()) return;
    const plan = this.pending();
    if (!plan || !this.accepted()) return;
    this.busy.set(true);
    try {
      const result = await this.billing.choosePlan(plan.id);
      this.message.set(result === 'SCHEDULED' ? 'plans.scheduled' : 'plans.activated');
      this.pending.set(null);
      this.error.set('');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    } finally {
      this.busy.set(false);
    }
  }
  savings(plan: SubscriptionPlan): number {
    const spend = Math.max(0, Number.isFinite(this.monthlySpend()) ? this.monthlySpend() : 0);
    return money(
      Math.min(
        Math.round((cents(spend) * plan.discountRate) / 100),
        cents(plan.monthlyDiscountLimit),
      ) - cents(plan.monthlyPrice),
    );
  }
}
