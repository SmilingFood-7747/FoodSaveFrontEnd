import { inject, Injectable } from '@angular/core';
import { OfferRepository } from '../domain/repositories/offer.repository';
import { OfferData } from '../domain/model/offer';
import { BackendCatalogApi } from '../../shared/infrastructure/backend-catalog.api';
@Injectable()
export class ApiOfferRepository extends OfferRepository {
  private readonly catalog = inject(BackendCatalogApi);
  all(): OfferData[] {
    return this.catalog.offers();
  }
  save(offer: OfferData, token: string): Promise<OfferData> {
    return this.catalog.saveOffer(offer, token);
  }
  pause(id: number, token: string): Promise<OfferData> {
    return this.catalog.pauseOffer(id, token);
  }
}
