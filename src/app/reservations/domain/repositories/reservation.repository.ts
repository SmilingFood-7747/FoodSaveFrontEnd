import { ReservationData } from '../model/reservation';
export abstract class ReservationRepository {
  abstract all(): ReservationData[];
  abstract create(offerId: number, quantity: number, token: string): Promise<ReservationData>;
  abstract cancel(id: number, token: string): Promise<void>;
  abstract confirm(id: number, code: string, token: string): Promise<ReservationData>;
}
