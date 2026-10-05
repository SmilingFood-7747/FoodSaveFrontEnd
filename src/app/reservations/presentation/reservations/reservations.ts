import { BrowserImageStorage } from '../../../shared/infrastructure/browser-image-storage';
import { Component, computed, inject, signal, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UI } from '../../../shared/presentation/ui';
import { ReservationService } from '../../application/reservation.service';
import { OfferService } from '../../../offers/application/offer.service';
import { BusinessService } from '../../../businesses/application/business.service';
import { FeedbackService } from '../../../feedback/application/feedback.service';
@Component({
  selector: 'app-reservations',
  encapsulation: ViewEncapsulation.None,
  imports: UI,
  templateUrl: './reservations.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './reservations.css',
})
export class Reservations {
  private readonly images = inject(BrowserImageStorage);
  readonly reservations = inject(ReservationService);
  readonly offers = inject(OfferService);
  readonly failedImages = signal<string[]>([]);
  readonly imageUrls = computed(() => {
    const urls: Record<number, Promise<string | null>> = {};
    for (const offer of this.offers.all()) {
      urls[offer.id] = this.images.resolve(offer.image);
    }
    return urls;
  });
  readonly businesses = inject(BusinessService);
  readonly feedback = inject(FeedbackService);
  private readonly translate = inject(TranslateService);
  readonly businessMode = inject(ActivatedRoute).snapshot.data['business'] === true;
  readonly filter = signal('all');
  readonly query = signal('');
  readonly period = signal(0);
  readonly code = signal('');
  readonly message = signal('');
  readonly error = signal('');
  readonly reviewId = signal<number | null>(null);
  readonly rating = signal(5);
  readonly comment = signal('');
  readonly createdId = Number(inject(ActivatedRoute).snapshot.queryParamMap.get('created'));
  readonly results = computed(() => {
    const reservations = this.businessMode
      ? this.reservations.businessReservations()
      : this.reservations.mine();

    const filtered = reservations.filter((reservation) => {
      const title = this.offers.get(reservation.offerId)?.title;
      const text = `${reservation.pickupCode} ${title}`;
      const matchesStatus = this.filter() === 'all' || reservation.status === this.filter();
      const matchesSearch = text.toLowerCase().includes(this.query().toLowerCase());
      const startDate = Date.now() - this.period() * 24 * 60 * 60 * 1000;
      const matchesPeriod = this.period() === 0 || Date.parse(reservation.createdAt) >= startDate;
      return matchesStatus && matchesSearch && matchesPeriod;
    });

    return filtered.sort((first, second) => second.id - first.id);
  });
  imageFailed(url: string): void {
    this.failedImages.update((urls) => (urls.includes(url) ? urls : [...urls, url]));
  }
  cancel(id: number): void {
    if (!confirm(this.translate.instant('reservation.cancelConfirm'))) return;
    try {
      this.reservations.cancel(id);
      this.message.set('reservation.cancelled');
      this.error.set('');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    }
  }
  collect(): void {
    try {
      this.reservations.confirmPickup(this.code());
      this.code.set('');
      this.message.set('reservation.collected');
      this.error.set('');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    }
  }
  reviewed(id: number): boolean {
    return this.feedback.reviews().some((r) => r.reservationId === id);
  }
  review(): void {
    const reservationId = this.reviewId();
    if (reservationId === null) return;
    try {
      this.feedback.review(reservationId, Number(this.rating()), this.comment());
      this.reviewId.set(null);
      this.comment.set('');
      this.message.set('review.saved');
      this.error.set('');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    }
  }
}
