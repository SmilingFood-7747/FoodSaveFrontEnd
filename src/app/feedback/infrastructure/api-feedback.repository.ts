import { inject, Injectable } from '@angular/core';
import { FeedbackRepository } from '../domain/repositories/feedback.repository';
import { Review, SupportRequest } from '../domain/model/review';
import { ApiDatabase, upsert } from '../../shared/infrastructure/api-database';
@Injectable()
export class ApiFeedbackRepository extends FeedbackRepository {
  private readonly db = inject(ApiDatabase);
  reviews(): Review[] {
    return this.db.state().reviews;
  }
  requests(): SupportRequest[] {
    return this.db.state().requests;
  }
  saveReview(review: Review): Promise<void> {
    return this.db.commit((s) => ({ ...s, reviews: upsert(s.reviews, review) }));
  }
  saveRequest(request: SupportRequest): Promise<void> {
    return this.db.commit((s) => ({ ...s, requests: upsert(s.requests, request) }));
  }
}
