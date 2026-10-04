import { DomainError } from '../../../shared/domain/model/domain-error';
export type OfferStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED';
export interface OfferData {
  id: number;
  businessId: number;
  category: string;
  title: string;
  description: string;
  allergens: string;
  originalPrice: number;
  offerPrice: number;
  initialUnits: number;
  availableUnits: number;
  pickupStartAt: string;
  pickupEndAt: string;
  expiresAt: string;
  status: OfferStatus;
  image: string;
}
export class Offer {
  constructor(readonly data: OfferData) {}
  static validate(data: OfferData): void {
    if (!data.title.trim() || !data.description.trim() || !data.category)
      throw new DomainError('errors.required');
    if (!(data.offerPrice > 0 && data.originalPrice > data.offerPrice))
      throw new DomainError('errors.invalidPrice');
    if (!Number.isInteger(data.initialUnits) || data.initialUnits <= 0)
      throw new DomainError('errors.invalidUnits');
    const start = Date.parse(data.pickupStartAt);
    const end = Date.parse(data.pickupEndAt);
    const expiry = Date.parse(data.expiresAt);
    const validDates = Number.isFinite(start) && Number.isFinite(end) && Number.isFinite(expiry);
    if (!validDates || start >= end || expiry <= Date.now() || expiry > end)
      throw new DomainError('errors.invalidWindow');
  }
  get status(): OfferStatus {
    if (Date.parse(this.data.expiresAt) <= Date.now()) return 'EXPIRED';
    return this.data.status;
  }
  get discount(): number {
    return Math.round((1 - this.data.offerPrice / this.data.originalPrice) * 100);
  }
  isReservable(quantity = 1): boolean {
    return (
      this.status === 'ACTIVE' &&
      Number.isInteger(quantity) &&
      quantity > 0 &&
      quantity <= this.data.availableUnits
    );
  }
  allocate(quantity: number): OfferData {
    if (!this.isReservable(quantity)) throw new DomainError('errors.unavailable');
    return { ...this.data, availableUnits: this.data.availableUnits - quantity };
  }
  release(quantity: number): OfferData {
    return {
      ...this.data,
      availableUnits: Math.min(this.data.initialUnits, this.data.availableUnits + quantity),
    };
  }
}
