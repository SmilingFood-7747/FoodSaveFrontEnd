import { inject, Injectable } from '@angular/core';
import { OfferRepository } from '../domain/repositories/offer.repository';
import { OfferData } from '../domain/model/offer';
import { BrowserDatabase, upsert } from '../../shared/infrastructure/browser-database';
@Injectable()
export class BrowserOfferRepository extends OfferRepository {
  private readonly db = inject(BrowserDatabase);
  all(): OfferData[] {
    return this.db.state().offers;
  }
  save(offer: OfferData): void {
    this.db.commit((s) => ({ ...s, offers: upsert(s.offers, offer) }));
  }
}
