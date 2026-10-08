import { NearbyOfferService } from '../../application/nearby-offer.service';
import { BillingService } from '../../../billing/application/billing.service';
import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UI } from '../../../shared/presentation/ui';
import { OfferCard } from '../components/offer-card/offer-card';
import { OfferService } from '../../application/offer.service';
import { BusinessService } from '../../../businesses/application/business.service';
import { GeolocationService } from '../../../shared/application/geolocation.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-catalog',
  encapsulation: ViewEncapsulation.None,
  imports: [...UI, OfferCard],
  templateUrl: './catalog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './catalog.css',
})
export class Catalog {
  readonly billing = inject(BillingService);
  readonly nearby = inject(NearbyOfferService);
  readonly offers = inject(OfferService);
  readonly businesses = inject(BusinessService);
  readonly geo = inject(GeolocationService);
  readonly query = signal('');
  readonly category = signal('all');
  readonly district = signal('all');
  readonly radius = signal(0);
  readonly pickupBefore = signal('');
  readonly availableOnly = signal(true);
  readonly exclusiveOnly = signal(false);
  readonly exclusiveCount = computed(
    () =>
      this.offers
        .active()
        .filter((offer) => offer.availableUnits > 0 && this.billing.isExclusiveOffer(offer)).length,
  );
  readonly locationError = signal(false);
  readonly categories = ['all', 'meals', 'bakery', 'vegetarian', 'desserts'];
  readonly districts = computed(() => [...new Set(this.businesses.all().map((b) => b.district))]);
  readonly results = computed(() =>
    this.offers
      .active()
      .filter((o) => {
        const business = this.businesses.get(o.businessId);
        const text = `${o.title} ${o.description} ${business?.name}`.toLowerCase();
        const distance = business ? this.geo.distance(business.latitude, business.longitude) : null;
        const time = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Lima',
          hour12: false,
        }).format(new Date(o.pickupEndAt));
        const matchesSearch = text.includes(this.query().trim().toLowerCase());
        const matchesCategory = this.category() === 'all' || o.category === this.category();
        const matchesDistrict = this.district() === 'all' || business?.district === this.district();
        const hasUnits = !this.availableOnly() || o.availableUnits > 0;
        const matchesDistance = !this.radius() || (distance !== null && distance <= this.radius());
        const matchesTime = !this.pickupBefore() || time <= this.pickupBefore();

        return (
          (!this.exclusiveOnly() || this.billing.isExclusiveOffer(o)) &&
          matchesSearch &&
          matchesCategory &&
          matchesDistrict &&
          hasUnits &&
          matchesDistance &&
          matchesTime
        );
      })
      .sort(
        (a, b) =>
          Number(this.billing.isExclusiveOffer(b)) - Number(this.billing.isExclusiveOffer(a)) ||
          Number(this.billing.businessPlan(b.businessId).featuredOffers) -
            Number(this.billing.businessPlan(a.businessId).featuredOffers),
      ),
  );
  constructor() {
    inject(ActivatedRoute)
      .queryParamMap.pipe(takeUntilDestroyed())
      .subscribe((p) => this.query.set(p.get('q') ?? ''));
  }
  clear(): void {
    this.query.set('');
    this.category.set('all');
    this.district.set('all');
    this.radius.set(0);
    this.pickupBefore.set('');
    this.availableOnly.set(true);
    this.exclusiveOnly.set(false);
  }
  async locate(): Promise<void> {
    try {
      this.locationError.set(false);
      await this.geo.locate();
    } catch {
      this.locationError.set(true);
    }
  }
}
