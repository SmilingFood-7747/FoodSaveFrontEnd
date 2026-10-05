import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { UI } from '../../../shared/presentation/ui';
import { ReportingService } from '../../application/reporting.service';
import { BusinessService } from '../../application/business.service';
import { SessionService } from '../../../iam/application/session.service';
@Component({
  selector: 'app-dashboard',
  imports: UI,
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly reporting = inject(ReportingService);
  readonly businesses = inject(BusinessService);
  readonly session = inject(SessionService);
  width(count: number): number {
    const total = this.reporting.summary().reservations;
    if (total === 0) return 0;
    return (count / total) * 100;
  }
}
