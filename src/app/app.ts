import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ReservationService } from './reservations/application/reservation.service';
import { Layout } from './shared/presentation/components/layout/layout';
import { Content } from './shared/presentation/components/content/content';
import { Footer } from './shared/presentation/components/footer/footer';
@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  imports: [Layout, Content, Footer],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App {
  private readonly reservationLifecycle = inject(ReservationService);
}
