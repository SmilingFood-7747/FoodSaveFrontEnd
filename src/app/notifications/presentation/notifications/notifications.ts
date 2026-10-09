import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { UI } from '../../../shared/presentation/ui';
import { NotificationService } from '../../application/notification.service';
import { ReservationService } from '../../../reservations/application/reservation.service';
import { OfferService } from '../../../offers/application/offer.service';
import { BusinessService } from '../../../businesses/application/business.service';
import { NearbyOfferService } from '../../../offers/application/nearby-offer.service';
@Component({
  selector: 'app-notifications',
  encapsulation: ViewEncapsulation.None,
  imports: UI,
  templateUrl: './notifications.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './notifications.css',
})
export class Notifications {
  readonly nearby = inject(NearbyOfferService);
  readonly notifications = inject(NotificationService);
  readonly reservations = inject(ReservationService);
  readonly offers = inject(OfferService);
  readonly businesses = inject(BusinessService);
  readonly reminders = signal(this.notifications.preferences().remindersEnabled);
  readonly saved = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly nearbyEnabled = signal(this.notifications.preferences().nearbyOffersEnabled !== false);
  reservation(id?: number) {
    return this.reservations.all().find((r) => r.id === id);
  }
  async save(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.saved.set(false);
    this.error.set('');
    try {
      await this.notifications.savePreferences({
        ...this.notifications.preferences(),
        remindersEnabled: this.reminders(),
        nearbyOffersEnabled: this.nearbyEnabled(),
      });
      this.saved.set(true);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    } finally {
      this.busy.set(false);
    }
  }
  async markRead(id: number): Promise<void> {
    try {
      await this.notifications.markRead(id);
      this.error.set('');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    }
  }
}
