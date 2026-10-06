import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { UI } from '../../../shared/presentation/ui';
import { AdminService } from '../../application/admin.service';
@Component({
  selector: 'app-admin-dashboard',
  imports: UI,
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AdminDashboard {
  readonly admin = inject(AdminService);
}
