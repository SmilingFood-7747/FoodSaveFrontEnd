import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Header } from '../header/header';
import { UI } from '../../ui';
import { SessionService } from '../../../../iam/application/session.service';
import { BrowserDatabase } from '../../../infrastructure/browser-database';
@Component({
  selector: 'app-layout',
  imports: [...UI, Header],
  templateUrl: './layout.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './layout.css',
})
export class Layout {
  readonly session = inject(SessionService);
  readonly storage = inject(BrowserDatabase);
  readonly menuOpen = signal(false);
}
