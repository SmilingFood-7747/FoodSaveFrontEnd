import { BrowserImageStorage } from '../../../../shared/infrastructure/browser-image-storage';
import { Component, computed, inject, input, signal } from '@angular/core';
import { UI } from '../../../../shared/presentation/ui';
import { Offer, OfferData } from '../../../domain/model/offer';
import { BusinessService } from '../../../../businesses/application/business.service';
import { GeolocationService } from '../../../../shared/application/geolocation.service';
@Component({
  selector: 'app-offer-card',
  imports: UI,
  templateUrl: './offer-card.html',
  styleUrl: './offer-card.css',
})
export class OfferCard {
  private readonly images = inject(BrowserImageStorage);
  readonly offer = input.required<OfferData>();
  readonly imageUrl = computed(() => this.images.resolve(this.offer().image));
  readonly failedImage = signal<string | null>(null);
  readonly businesses = inject(BusinessService);
  readonly geo = inject(GeolocationService);
  discount(): number {
    return new Offer(this.offer()).discount;
  }
  distance(): number | null {
    const b = this.businesses.get(this.offer().businessId);
    return b ? this.geo.distance(b.latitude, b.longitude) : null;
  }
}
