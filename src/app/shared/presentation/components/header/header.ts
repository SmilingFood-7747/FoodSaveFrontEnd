import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UI } from '../../ui';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { SessionService } from '../../../../iam/application/session.service';
import { NotificationService } from '../../../../notifications/application/notification.service';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-header',
  imports: [...UI, LanguageSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly session = inject(SessionService);
  readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  readonly search = signal('');
  private readonly document = inject(DOCUMENT);
  skip(event: Event): void {
    event.preventDefault();
    const content = this.document.getElementById('main-content');
    content?.focus();
    content?.scrollIntoView({ block: 'start' });
  }
  find(): void {
    this.router.navigate(['/offers'], { queryParams: { q: this.search() } });
  }
  logout(): void {
    this.session.signOut();
    this.router.navigate(['/offers']);
  }
}
