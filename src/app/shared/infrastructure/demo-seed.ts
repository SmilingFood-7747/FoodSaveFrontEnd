import { createDemoAccounts } from '../../iam/infrastructure/account-data';
import { createDemoBusinesses } from '../../businesses/infrastructure/business-data';
import { createDemoOffers } from '../../offers/infrastructure/offer-data';
import { createDemoReservations } from '../../reservations/infrastructure/reservation-data';

export function demoSeed() {
  const now = Date.now();
  return {
    subscriptions: [],
    subscriptionCharges: [],
    accounts: createDemoAccounts(),
    businesses: createDemoBusinesses(),
    offers: createDemoOffers(now),
    reservations: createDemoReservations(now),
    notifications: [],
    reviews: [],
    requests: [],
    preferences: {},
  };
}
