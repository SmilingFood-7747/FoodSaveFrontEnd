import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatButtonModule, MatIconModule, TranslatePipe, LanguageSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly document = inject(DOCUMENT);

  skip(event: Event): void {
    event.preventDefault();
    const content = this.document.getElementById('main-content');
    content?.focus();
    content?.scrollIntoView({ block: 'start' });
  }
}
