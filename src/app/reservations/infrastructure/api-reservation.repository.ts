import { inject, Injectable } from '@angular/core';
import { ReservationRepository } from '../domain/repositories/reservation.repository';
import { ReservationData } from '../domain/model/reservation';
import { ApiDatabase, upsert } from '../../shared/infrastructure/api-database';
@Injectable()
export class ApiReservationRepository extends ReservationRepository {
  private readonly db = inject(ApiDatabase);
  all(): ReservationData[] {
    return this.db.state().reservations;
  }
  save(reservation: ReservationData): Promise<void> {
    return this.db.commit((s) => ({ ...s, reservations: upsert(s.reservations, reservation) }));
  }
}
