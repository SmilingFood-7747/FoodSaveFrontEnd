import { DomainError } from '../../../shared/domain/model/domain-error';
export type ReservationStatus = 'ACTIVE' | 'COLLECTED' | 'CANCELLED' | 'EXPIRED';
export interface ReservationData {
  id: number;
  offerId: number;
  customerUserId: number;
  quantity: number;
  unitPrice: number;
  originalUnitPrice: number;
  pickupCode: string;
  pickupStartAt: string;
  pickupDeadlineAt: string;
  status: ReservationStatus;
  createdAt: string;
  collectedAt?: string;
}
export class Reservation {
  constructor(readonly data: ReservationData) {}
  get status(): ReservationStatus {
    return this.data.status === 'ACTIVE' && Date.parse(this.data.pickupDeadlineAt) <= Date.now()
      ? 'EXPIRED'
      : this.data.status;
  }
  cancel(): ReservationData {
    if (this.status !== 'ACTIVE' || Date.parse(this.data.pickupStartAt) <= Date.now())
      throw new DomainError('errors.cannotCancel');
    return { ...this.data, status: 'CANCELLED' };
  }
  collect(): ReservationData {
    if (this.status !== 'ACTIVE') throw new DomainError('errors.invalidCode');
    if (Date.parse(this.data.pickupStartAt) > Date.now())
      throw new DomainError('errors.pickupNotStarted');
    return { ...this.data, status: 'COLLECTED', collectedAt: new Date().toISOString() };
  }
}
