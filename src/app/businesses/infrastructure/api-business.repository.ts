import { inject, Injectable } from '@angular/core';
import { BusinessRepository } from '../domain/repositories/business.repository';
import { Business } from '../domain/model/business';
import { BackendCatalogApi } from '../../shared/infrastructure/backend-catalog.api';
@Injectable()
export class ApiBusinessRepository extends BusinessRepository {
  private readonly catalog = inject(BackendCatalogApi);
  all(): Business[] {
    return this.catalog.businesses();
  }
  save(business: Business, token: string): Promise<Business> {
    return this.catalog.saveBusiness(business, token);
  }
}
