import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { UI } from '../../../shared/presentation/ui';
import { TranslateService } from '@ngx-translate/core';
import { OfferService } from '../../application/offer.service';
@Component({
  selector: 'app-manage-offers',
  encapsulation: ViewEncapsulation.None,
  imports: UI,
  templateUrl: './manage-offers.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './manage-offers.css',
})
export class ManageOffers {
  readonly busy = signal(false);
  readonly offers = inject(OfferService);
  private readonly translate = inject(TranslateService);
  readonly error = signal('');
  async pause(id: number): Promise<void> {
    if (this.busy()) return;
    if (!confirm(this.translate.instant('editor.pauseConfirm'))) return;
    this.busy.set(true);
    try {
      await this.offers.pause(id);
      this.error.set('');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    } finally {
      this.busy.set(false);
    }
  }
}
