import { BrowserImageStorage } from '../../../shared/infrastructure/browser-image-storage';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UI } from '../../../shared/presentation/ui';
import { OfferService } from '../../application/offer.service';
import { BusinessService } from '../../../businesses/application/business.service';
import { ReservationService } from '../../../reservations/application/reservation.service';
import { SessionService } from '../../../iam/application/session.service';
import { Offer } from '../../domain/model/offer';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-offer-detail',
  imports: UI,
  templateUrl: './offer-detail.html',
  styleUrl: './offer-detail.css',
})
export class OfferDetail {
  private readonly images = inject(BrowserImageStorage);
  readonly offers = inject(OfferService);
  readonly businesses = inject(BusinessService);
  readonly session = inject(SessionService);
  private readonly reservations = inject(ReservationService);
  private readonly router = inject(Router);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  readonly offer = computed(() => this.offers.get(this.id));
  readonly imageUrl = computed(() => this.images.resolve(this.offer()?.image));
  readonly failedImage = signal<string | null>(null);
  readonly business = computed(() => this.businesses.get(this.offer()?.businessId ?? 0));
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
  reservable(): boolean {
    const o = this.offer();
    return !!o && new Offer(o).isReservable(this.quantity());
  }
  reserve(): void {
    if (!this.session.user()) {
      this.router.navigate(['/sign-in'], { queryParams: { redirect: `/offers/${this.id}` } });
      return;
    }
    try {
      this.error.set('');
      const r = this.reservations.create(this.id, Number(this.quantity()));
      this.router.navigate(['/reservations'], { queryParams: { created: r.id } });
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    }
  }
}
