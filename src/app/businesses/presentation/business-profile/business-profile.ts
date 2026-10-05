import { Component, computed, inject, signal, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { UI } from '../../../shared/presentation/ui';
import { BusinessService } from '../../application/business.service';
import { OfferService } from '../../../offers/application/offer.service';
import { OfferCard } from '../../../offers/presentation/components/offer-card/offer-card';
import { SessionService } from '../../../iam/application/session.service';
@Component({
  selector: 'app-business-profile',
  encapsulation: ViewEncapsulation.None,
  imports: [...UI, OfferCard],
  templateUrl: './business-profile.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './business-profile.css',
})
export class BusinessProfile {
  readonly businesses = inject(BusinessService);
  readonly session = inject(SessionService);
  readonly offers = inject(OfferService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly route = inject(ActivatedRoute);
  readonly publicMode = this.route.snapshot.data['public'] === true;
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly current = computed(() =>
    this.publicMode ? this.businesses.get(this.id) : this.businesses.owned()[0],
  );
  readonly publicOffers = computed(() =>
    this.offers.active().filter((o) => o.businessId === this.current()?.id),
  );
  readonly districts = [
    'Miraflores',
    'San Isidro',
    'San Miguel',
    'Barranco',
    'Surco',
    'Chorrillos',
    'Lima',
    'Villa El Salvador',
  ];
  readonly name = signal(this.current()?.name ?? '');
  readonly address = signal(this.current()?.address ?? '');
  readonly district = signal(this.current()?.district ?? 'Miraflores');
  readonly phone = signal(this.current()?.contactPhone ?? '');
  readonly conditions = signal(this.current()?.pickupConditions ?? '');
  readonly latitude = signal(this.current()?.latitude ?? -12.12);
  readonly longitude = signal(this.current()?.longitude ?? -77.03);
  readonly message = signal('');
  readonly error = signal('');
  readonly map = computed(() => {
    const b = this.current();
    if (!b) return null;
    const lat = b.latitude,
      lon = b.longitude;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.006}%2C${lat - 0.004}%2C${lon + 0.006}%2C${lat + 0.004}&layer=mapnik&marker=${lat}%2C${lon}`,
    );
  });
  save(): void {
    try {
      this.businesses.save(
        {
          name: this.name(),
          address: this.address(),
          district: this.district(),
          contactPhone: this.phone(),
          pickupConditions: this.conditions(),
          latitude: Number(this.latitude()),
          longitude: Number(this.longitude()),
        },
        this.current()?.id,
      );
      this.message.set('business.saved');
      this.error.set('');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    }
  }
}
