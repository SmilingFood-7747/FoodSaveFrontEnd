import { inject, Injectable } from '@angular/core';
import { FeedbackRepository } from '../domain/repositories/feedback.repository';
import { Review, SupportRequest } from '../domain/model/review';
import { BrowserDatabase, upsert } from '../../shared/infrastructure/browser-database';
@Injectable()
export class BrowserFeedbackRepository extends FeedbackRepository {
  private readonly db = inject(BrowserDatabase);
  reviews(): Review[] {
    return this.db.state().reviews;
  }
  requests(): SupportRequest[] {
    return this.db.state().requests;
  }
  saveReview(review: Review): void {
    this.db.commit((s) => ({ ...s, reviews: upsert(s.reviews, review) }));
  }
  saveRequest(request: SupportRequest): void {
    this.db.commit((s) => ({ ...s, requests: upsert(s.requests, request) }));
  }
}
