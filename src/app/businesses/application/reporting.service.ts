import { computed, inject, Injectable, signal } from '@angular/core';
import { OfferService } from '../../offers/application/offer.service';
import { ReservationService } from '../../reservations/application/reservation.service';
@Injectable({ providedIn: 'root' })
export class ReportingService {
  private readonly offers = inject(OfferService);
  private readonly reservations = inject(ReservationService);
  readonly period = signal(30);
  readonly rows = computed(() => {
    const reservations = this.reservations.businessReservations();
    const days = this.period();
    if (days === 0) return reservations;

    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;
    return reservations.filter((reservation) => Date.parse(reservation.createdAt) >= startDate);
  });
  readonly summary = computed(() => {
    const rows = this.rows();
    const summary = {
      offers: this.offers.owned().length,
      reservations: rows.length,
      collected: 0,
      recovered: 0,
      saved: 0,
      active: 0,
      cancelled: 0,
      expired: 0,
    };

    for (const reservation of rows) {
      if (reservation.status === 'COLLECTED') {
        summary.collected += reservation.quantity;
        summary.recovered += reservation.unitPrice * reservation.quantity;
        summary.saved +=
          (reservation.originalUnitPrice - reservation.unitPrice) * reservation.quantity;
      }
      if (reservation.status === 'ACTIVE') summary.active += 1;
      if (reservation.status === 'CANCELLED') summary.cancelled += 1;
      if (reservation.status === 'EXPIRED') summary.expired += 1;
    }

    return summary;
  });
}
