import { Review, SupportRequest } from '../model/review';
export abstract class FeedbackRepository {
  abstract reviews(): Review[];
  abstract requests(): SupportRequest[];
  abstract saveReview(review: Review): Promise<void>;
  abstract saveRequest(request: SupportRequest): Promise<void>;
}
