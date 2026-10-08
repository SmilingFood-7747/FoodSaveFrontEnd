import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { NearbyOfferService } from '../../../../offers/application/nearby-offer.service';
import { Header } from '../header/header';
import { UI } from '../../ui';
import { SessionService } from '../../../../iam/application/session.service';
import { BrowserDatabase } from '../../../infrastructure/browser-database';
@Component({
  selector: 'app-layout',
  encapsulation: ViewEncapsulation.None,
  imports: [...UI, Header],
  templateUrl: './layout.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './layout.css',
})
export class Layout {
  readonly session = inject(SessionService);
  readonly nearby = inject(NearbyOfferService);
  readonly storage = inject(BrowserDatabase);
  readonly menuOpen = signal(false);
}
