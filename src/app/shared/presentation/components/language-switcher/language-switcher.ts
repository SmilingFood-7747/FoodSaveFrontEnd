import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import { Language, LanguageService } from '../../../application/language.service';

@Component({
  selector: 'app-language-switcher',
  encapsulation: ViewEncapsulation.None,
  imports: [MatButtonToggleGroup, MatButtonToggle, TranslatePipe],
  templateUrl: './language-switcher.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  readonly language = inject(LanguageService);
  readonly languages: { code: Language; label: string; name: string }[] = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'es', label: 'ES', name: 'Español' },
  ];

  async useLanguage(language: Language): Promise<void> {
    await this.language.change(language);
  }
}
