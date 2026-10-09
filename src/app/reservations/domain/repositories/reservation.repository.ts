import { ReservationData } from '../model/reservation';
export abstract class ReservationRepository {
  abstract all(): ReservationData[];
  abstract save(reservation: ReservationData): Promise<void>;
}
