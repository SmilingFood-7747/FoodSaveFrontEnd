import { inject, Injectable } from '@angular/core';
import { OfferRepository } from '../domain/repositories/offer.repository';
import { OfferData } from '../domain/model/offer';
import { ApiDatabase, upsert } from '../../shared/infrastructure/api-database';
@Injectable()
export class ApiOfferRepository extends OfferRepository {
  private readonly db = inject(ApiDatabase);
  all(): OfferData[] {
    return this.db.state().offers;
  }
  save(offer: OfferData): Promise<void> {
    return this.db.commit((s) => ({ ...s, offers: upsert(s.offers, offer) }));
  }
}
