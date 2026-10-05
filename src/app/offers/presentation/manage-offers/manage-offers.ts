import { Component, inject, signal, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
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
  readonly offers = inject(OfferService);
  private readonly translate = inject(TranslateService);
  readonly error = signal('');
  pause(id: number): void {
    if (!confirm(this.translate.instant('editor.pauseConfirm'))) return;
    try {
      this.offers.pause(id);
      this.error.set('');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    }
  }
}
