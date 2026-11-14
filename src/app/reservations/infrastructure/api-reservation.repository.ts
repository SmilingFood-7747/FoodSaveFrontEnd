import { inject, Injectable } from '@angular/core';
import { ReservationRepository } from '../domain/repositories/reservation.repository';
import { ReservationData } from '../domain/model/reservation';
import { BackendCatalogApi } from '../../shared/infrastructure/backend-catalog.api';
@Injectable()
export class ApiReservationRepository extends ReservationRepository {
  private readonly catalog = inject(BackendCatalogApi);
  all(): ReservationData[] {
    return this.catalog.reservations();
  }
  create(offerId: number, quantity: number, token: string): Promise<ReservationData> {
    return this.catalog.createReservation(offerId, quantity, token);
  }
  cancel(id: number, token: string): Promise<void> {
    return this.catalog.cancelReservation(id, token);
  }
  confirm(id: number, code: string, token: string): Promise<ReservationData> {
    return this.catalog.confirmReservation(id, code, token);
  }
}
