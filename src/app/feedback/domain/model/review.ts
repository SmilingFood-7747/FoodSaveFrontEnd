import { DomainError } from '../../../shared/domain/model/domain-error';
export interface Review {
  id: number;
  reservationId: number;
  rating: number;
  comment: string;
  createdAt: string;
}
export interface SupportRequest {
  id: number;
  requesterAccountId: number;
  reservationId?: number;
  subject: string;
  description: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
}
export function validateRating(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    throw new DomainError('errors.invalidRating');
}
