import { Business } from '../model/business';
export abstract class BusinessRepository {
  abstract all(): Business[];
  abstract save(business: Business): Promise<void>;
}
