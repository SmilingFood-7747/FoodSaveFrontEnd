import { OfferData } from '../model/offer';
export abstract class OfferRepository {
  abstract all(): OfferData[];
  abstract save(offer: OfferData): Promise<void>;
}
