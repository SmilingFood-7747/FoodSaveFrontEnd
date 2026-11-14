import { OfferData } from '../model/offer';
export abstract class OfferRepository {
  abstract all(): OfferData[];
  abstract save(offer: OfferData, token: string): Promise<OfferData>;
  abstract pause(id: number, token: string): Promise<OfferData>;
}
