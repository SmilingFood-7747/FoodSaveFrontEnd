import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
export type Language = 'en' | 'es';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  readonly current = signal<Language>(this.saved());
  private saved(): Language {
    try {
      return localStorage.getItem('foodsave-language')?.startsWith('es') ? 'es' : 'en';
    } catch {
      return 'en';
    }
  }
  async initialize(): Promise<void> {
    await this.change(this.current());
  }
  async change(language: Language): Promise<void> {
    await firstValueFrom(this.translate.use(language));
    this.current.set(language);
    this.document.documentElement.lang = language;
    this.document.title = this.translate.instant('app.title');
    this.document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', this.translate.instant('app.description'));
    try {
      localStorage.setItem('foodsave-language', language);
    } catch {}
  }
}
