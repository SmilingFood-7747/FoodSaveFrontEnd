import { inject, Injectable } from '@angular/core';
import { ReservationRepository } from '../domain/repositories/reservation.repository';
import { ReservationData } from '../domain/model/reservation';
import { BrowserDatabase, upsert } from '../../shared/infrastructure/browser-database';
@Injectable()
export class BrowserReservationRepository extends ReservationRepository {
  private readonly db = inject(BrowserDatabase);
  all(): ReservationData[] {
    return this.db.state().reservations;
  }
  save(reservation: ReservationData): void {
    this.db.commit((s) => ({ ...s, reservations: upsert(s.reservations, reservation) }));
  }
}
