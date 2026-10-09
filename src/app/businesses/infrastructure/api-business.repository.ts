import { inject, Injectable } from '@angular/core';
import { BusinessRepository } from '../domain/repositories/business.repository';
import { Business } from '../domain/model/business';
import { ApiDatabase, upsert } from '../../shared/infrastructure/api-database';
@Injectable()
export class ApiBusinessRepository extends BusinessRepository {
  private readonly db = inject(ApiDatabase);
  all(): Business[] {
    return this.db.state().businesses;
  }
  save(business: Business): Promise<void> {
    return this.db.commit((s) => ({ ...s, businesses: upsert(s.businesses, business) }));
  }
}
