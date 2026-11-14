import { inject, Injectable } from '@angular/core';
import { FeedbackRepository } from '../domain/repositories/feedback.repository';
import { Review, SupportRequest } from '../domain/model/review';
import { BackendCatalogApi } from '../../shared/infrastructure/backend-catalog.api';
import { SessionService } from '../../iam/application/session.service';
@Injectable()
export class ApiFeedbackRepository extends FeedbackRepository {
  private readonly catalog = inject(BackendCatalogApi);
  private readonly session = inject(SessionService);
  reviews(): Review[] {
    return this.catalog.reviews();
  }
  requests(): SupportRequest[] {
    return this.catalog.requests();
  }
  saveReview(review: Review): Promise<void> {
    const token = this.session.accessToken;
    if (!token) return Promise.reject(new Error('errors.signIn'));
    return this.catalog.submitReview(review.reservationId, review.rating, review.comment, token);
  }
  saveRequest(request: SupportRequest): Promise<void> {
    const token = this.session.accessToken;
    if (!token) return Promise.reject(new Error('errors.signIn'));
    return this.catalog.openSupportRequest(request.subject, request.description, request.reservationId, token);
  }
}
