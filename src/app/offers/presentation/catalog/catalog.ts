import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { GeolocationService } from '../../../shared/application/geolocation.service';

@Component({
  selector: 'app-catalog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    TranslatePipe,
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog {
  readonly geo = inject(GeolocationService);
  readonly query = signal('');
  readonly category = signal('all');
  readonly district = signal('all');
  readonly radius = signal(0);
  readonly pickupBefore = signal('');
  readonly availableOnly = signal(true);
  readonly locationError = signal(false);
  readonly categories = ['all', 'meals', 'bakery', 'vegetarian', 'desserts'];
  readonly districts = signal<string[]>([]);
  readonly results = signal([]);

  constructor() {
    inject(ActivatedRoute)
      .queryParamMap.pipe(takeUntilDestroyed())
      .subscribe((params) => this.query.set(params.get('q') ?? ''));
  }

  clear(): void {
    this.query.set('');
    this.category.set('all');
    this.district.set('all');
    this.radius.set(0);
    this.pickupBefore.set('');
    this.availableOnly.set(true);
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
