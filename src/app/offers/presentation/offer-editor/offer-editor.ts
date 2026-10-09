import {
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UI } from '../../../shared/presentation/ui';
import { OfferService } from '../../application/offer.service';
import { BusinessService } from '../../../businesses/application/business.service';
import { BrowserImageStorage } from '../../../shared/infrastructure/browser-image-storage';
import { Offer } from '../../domain/model/offer';
import { districtOptions } from '../../../shared/domain/model/lima-districts';
@Component({
  selector: 'app-offer-editor',
  encapsulation: ViewEncapsulation.None,
  imports: UI,
  templateUrl: './offer-editor.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './offer-editor.css',
})
export class OfferEditor {
  readonly offers = inject(OfferService);
  readonly businesses = inject(BusinessService);
  private readonly router = inject(Router);
  private readonly images = inject(BrowserImageStorage);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || undefined;
  readonly existing = this.id ? this.offers.get(this.id) : undefined;
  readonly existingImage = this.images.resolve(this.existing?.image);
  readonly failedImage = signal<string | null>(null);
  private local(value: string): string {
    const d = new Date(value);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
  readonly businessId = signal(this.existing?.businessId ?? this.businesses.owned()[0]?.id ?? 0);
  readonly districtFilter = signal('all');
  readonly districts = computed(() =>
    districtOptions(this.businesses.owned().map((b) => b.district)),
  );
  readonly filteredBusinesses = computed(() =>
    this.businesses
      .owned()
      .filter(
        (business) =>
          this.districtFilter() === 'all' || business.district === this.districtFilter(),
      ),
  );
  readonly pickupBusiness = computed(() => this.businesses.get(Number(this.businessId())));
  selectDistrict(district: string): void {
    this.districtFilter.set(district);
    const businesses = this.filteredBusinesses();
    if (!businesses.some((business) => business.id === Number(this.businessId())))
      this.businessId.set(businesses[0]?.id ?? 0);
  }
  readonly plusExclusive = signal(this.existing?.plusExclusive ?? false);
  readonly title = signal(this.existing?.title ?? '');
  readonly description = signal(this.existing?.description ?? '');
  readonly allergens = signal(this.existing?.allergens ?? '');
  readonly category = signal(this.existing?.category ?? 'meals');
  readonly originalPrice = signal(this.existing?.originalPrice ?? 0);
  readonly offerPrice = signal(this.existing?.offerPrice ?? 0);
  readonly units = signal(this.existing?.initialUnits ?? 1);
  readonly start = signal(
    this.local(this.existing?.pickupStartAt ?? new Date(Date.now() + 3600000).toISOString()),
  );
  readonly end = signal(
    this.local(
      this.existing?.pickupEndAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ),
  );
  readonly selectedImage = signal<File | null>(null);
  readonly preview = signal<string | null>(null);
  readonly checkingImage = signal(false);
  readonly saving = signal(false);
  readonly imageError = signal('');
  private selection = 0;
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      ++this.selection;
      const url = this.preview();
      if (url) URL.revokeObjectURL(url);
    });
  }
  clearImage(): void {
    ++this.selection;
    const url = this.preview();
    if (url) URL.revokeObjectURL(url);
    this.preview.set(null);
    this.selectedImage.set(null);
    this.checkingImage.set(false);
    this.imageError.set('');
  }
  async selectImage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.clearImage();
    const selection = this.selection;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size) {
      this.imageError.set('errors.image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.imageError.set('errors.imageSize');
      return;
    }
    this.checkingImage.set(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (selection !== this.selection) {
        URL.revokeObjectURL(url);
        return;
      }
      this.selectedImage.set(file);
      this.preview.set(url);
    } catch {
      URL.revokeObjectURL(url);
      if (selection === this.selection) this.imageError.set('errors.image');
    } finally {
      if (selection === this.selection) this.checkingImage.set(false);
    }
  }
  readonly error = signal('');
  readonly categories = ['meals', 'bakery', 'vegetarian', 'desserts'];
  submitLabel(): string {
    if (this.saving()) return 'editor.saving';
    if (this.id) return 'common.save';
    return 'editor.publish';
  }
  async save(): Promise<void> {
    if (this.saving() || this.checkingImage() || this.imageError()) return;
    this.saving.set(true);
    this.error.set('');
    let uploaded: string | undefined;
    try {
      const data = {
        businessId: Number(this.businessId()),
        plusExclusive:
          !!this.businesses.get(Number(this.businessId()))?.plusPartner && this.plusExclusive(),
        title: this.title(),
        description: this.description(),
        allergens: this.allergens(),
        category: this.category(),
        originalPrice: Number(this.originalPrice()),
        offerPrice: Number(this.offerPrice()),
        initialUnits: Number(this.units()),
        pickupStartAt: new Date(this.start()).toISOString(),
        pickupEndAt: new Date(this.end()).toISOString(),
        expiresAt: new Date(this.end()).toISOString(),
        image: this.existing?.image || '',
      };
      Offer.validate({
        ...data,
        id: this.id ?? 0,
        availableUnits: data.initialUnits,
        status: 'ACTIVE',
      });
      const file = this.selectedImage();
      if (file) {
        uploaded = await this.images.save(file);
        data.image = uploaded;
      }
      this.offers.save(data, this.id);
      uploaded = undefined;
      this.router.navigate(['/business/offers']);
    } catch (e) {
      if (uploaded) await this.images.remove(uploaded).catch(() => undefined);
      this.error.set(
        e instanceof Error && e.message.startsWith('errors.') ? e.message : 'errors.invalidWindow',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
