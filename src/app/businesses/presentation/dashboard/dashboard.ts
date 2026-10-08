import { BillingService } from '../../../billing/application/billing.service';
import {
  Component,
  computed,
  inject,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { UI } from '../../../shared/presentation/ui';
import { ReportingService } from '../../application/reporting.service';
import { BusinessService } from '../../application/business.service';
import { SessionService } from '../../../iam/application/session.service';
@Component({
  selector: 'app-dashboard',
  encapsulation: ViewEncapsulation.None,
  imports: UI,
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly reporting = inject(ReportingService);
  readonly businesses = inject(BusinessService);
  readonly billing = inject(BillingService);
  readonly finance = computed(() =>
    this.billing.financials(
      this.reporting.period(),
      this.businesses.owned().map((b) => b.id),
    ),
  );
  readonly businessRows = computed(() =>
    this.businesses.owned().map((b) => ({
      business: b,
      plan: this.billing.businessPlan(b.id),
      report: this.billing.businessReport(b.id, this.reporting.period()),
    })),
  );
  readonly session = inject(SessionService);
  width(count: number): number {
    const total = this.reporting.summary().reservations;
    if (total === 0) return 0;
    return (count / total) * 100;
  }
}
