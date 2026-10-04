import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

@Component({
  selector: 'app-header',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    LanguageSwitcher,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly search = signal('');
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  find(): void {
    this.router.navigate(['/offers'], { queryParams: { q: this.search() } });
  }

  skip(event: Event): void {
    event.preventDefault();
    const content = this.document.getElementById('main-content');
    content?.focus();
    content?.scrollIntoView({ block: 'start' });
  }
}
