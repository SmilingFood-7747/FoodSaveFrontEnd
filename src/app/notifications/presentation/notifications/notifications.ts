import { Component, inject, signal } from '@angular/core';
import { UI } from '../../../shared/presentation/ui';
import { NotificationService } from '../../application/notification.service';
import { ReservationService } from '../../../reservations/application/reservation.service';
import { OfferService } from '../../../offers/application/offer.service';
import { BusinessService } from '../../../businesses/application/business.service';
@Component({
  selector: 'app-notifications',
  imports: UI,
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications {
  readonly notifications = inject(NotificationService);
  readonly reservations = inject(ReservationService);
  readonly offers = inject(OfferService);
  readonly businesses = inject(BusinessService);
  readonly reminders = signal(this.notifications.preferences().remindersEnabled);
  readonly saved = signal(false);
  reservation(id?: number) {
    return this.reservations.all().find((r) => r.id === id);
  }
  save(): void {
    this.notifications.savePreferences({
      ...this.notifications.preferences(),
      remindersEnabled: this.reminders(),
    });
    this.saved.set(true);
  }
}
