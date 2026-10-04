import { computed, inject, Injectable } from '@angular/core';
import { FeedbackRepository } from '../domain/repositories/feedback.repository';
import { validateRating } from '../domain/model/review';
import { SessionService } from '../../iam/application/session.service';
import { ReservationService } from '../../reservations/application/reservation.service';
import { BrowserDatabase } from '../../shared/infrastructure/browser-database';
import { DomainError } from '../../shared/domain/model/domain-error';
@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly repository = inject(FeedbackRepository);
  private readonly session = inject(SessionService);
  private readonly reservations = inject(ReservationService);
  private readonly db = inject(BrowserDatabase);
  readonly reviews = computed(() => this.repository.reviews());
  readonly requests = computed(() =>
    this.repository.requests().filter((r) => r.requesterAccountId === this.session.user()?.id),
  );
  review(reservationId: number, rating: number, comment: string): void {
    this.session.require('CUSTOMER');
    validateRating(rating);
    if (!this.reservations.mine().some((r) => r.id === reservationId && r.status === 'COLLECTED'))
      throw new DomainError('errors.reviewPickup');
    if (this.reviews().some((r) => r.reservationId === reservationId))
      throw new DomainError('errors.reviewExists');
    this.repository.saveReview({
      id: this.db.nextId(this.reviews()),
      reservationId,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    });
  }
  request(subject: string, description: string, reservationId?: number): void {
    const user = this.session.require();
    if (!subject.trim() || !description.trim()) throw new DomainError('errors.required');
    const allowed =
      user.role === 'CUSTOMER'
        ? this.reservations.mine()
        : this.reservations.businessReservations();
    if (reservationId !== undefined && !allowed.some((r) => r.id === reservationId))
      throw new DomainError('errors.forbidden');
    this.repository.saveRequest({
      id: this.db.nextId(this.repository.requests()),
      requesterAccountId: user.id,
      subject: subject.trim(),
      description: description.trim(),
      reservationId,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    });
  }
}
