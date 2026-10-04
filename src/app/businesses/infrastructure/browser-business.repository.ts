import { inject, Injectable } from '@angular/core';
import { BusinessRepository } from '../domain/repositories/business.repository';
import { Business } from '../domain/model/business';
import { BrowserDatabase, upsert } from '../../shared/infrastructure/browser-database';
@Injectable()
export class BrowserBusinessRepository extends BusinessRepository {
  private readonly db = inject(BrowserDatabase);
  all(): Business[] {
    return this.db.state().businesses;
  }
  save(business: Business): void {
    this.db.commit((s) => ({ ...s, businesses: upsert(s.businesses, business) }));
  }
}
