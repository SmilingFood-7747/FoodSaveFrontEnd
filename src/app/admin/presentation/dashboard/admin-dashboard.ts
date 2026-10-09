import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
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
  readonly busy = signal(false);
  async setPlusPartner(id: number, selected: boolean): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.admin.setPlusPartner(id, selected);
    } catch {
      /* The shared banner displays the local save error. */
    } finally {
      this.busy.set(false);
    }
  }
}
