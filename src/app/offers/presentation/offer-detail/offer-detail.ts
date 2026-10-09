import { BillingService } from '../../../billing/application/billing.service';
import { BrowserImageStorage } from '../../../shared/infrastructure/browser-image-storage';
import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UI } from '../../../shared/presentation/ui';
import { OfferService } from '../../application/offer.service';
import { BusinessService } from '../../../businesses/application/business.service';
import { ReservationService } from '../../../reservations/application/reservation.service';
import { SessionService } from '../../../iam/application/session.service';
import { Offer } from '../../domain/model/offer';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-offer-detail',
  encapsulation: ViewEncapsulation.None,
  imports: UI,
  templateUrl: './offer-detail.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './offer-detail.css',
})
export class OfferDetail {
  readonly busy = signal(false);
  private readonly images = inject(BrowserImageStorage);
  readonly offers = inject(OfferService);
  readonly businesses = inject(BusinessService);
  readonly billing = inject(BillingService);
  readonly quote = computed(() =>
    this.billing.quote((this.offer()?.offerPrice ?? 0) * this.quantity()),
  );
  readonly session = inject(SessionService);
  private readonly reservations = inject(ReservationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly id = signal(Number(this.route.snapshot.paramMap.get('id')));
  readonly offer = computed(() => this.offers.get(this.id()));
  readonly imageUrl = computed(() => this.images.resolve(this.offer()?.image));
  readonly failedImage = signal<string | null>(null);
  readonly business = computed(() => this.businesses.get(this.offer()?.businessId ?? 0));
  readonly exclusive = computed(() => {
    const offer = this.offer();
    return !!offer && this.billing.isExclusiveOffer(offer);
  });
  readonly locked = computed(() => {
    const offer = this.offer();
    return !!offer && !this.billing.canReserveOffer(offer);
  });
  readonly quantity = signal(1);
  readonly error = signal('');
  readonly confirmed = signal(false);
  private readonly sanitizer = inject(DomSanitizer);
  readonly map = computed(() => {
    const business = this.business();
    if (!business) return null;
    const { latitude: lat, longitude: lon } = business;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.006}%2C${lat - 0.004}%2C${lon + 0.006}%2C${lat + 0.004}&layer=mapnik&marker=${lat}%2C${lon}`,
    );
  });
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.id.set(Number(params.get('id')));
      this.quantity.set(1);
      this.confirmed.set(false);
      this.error.set('');
      this.failedImage.set(null);
    });
  }
  reservable(): boolean {
    const o = this.offer();
    return !!o && new Offer(o).isReservable(this.quantity());
  }
  async reserve(): Promise<void> {
    if (this.busy()) return;
    if (!this.session.user()) {
      this.router.navigate(['/sign-in'], { queryParams: { redirect: `/offers/${this.id()}` } });
      return;
    }
    this.busy.set(true);
    try {
      this.error.set('');
      const r = await this.reservations.create(this.id(), Number(this.quantity()));
      this.router.navigate(['/reservations'], { queryParams: { created: r.id } });
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    } finally {
      this.busy.set(false);
    }
  }
}
