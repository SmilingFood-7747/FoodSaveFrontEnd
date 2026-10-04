import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../../application/language.service';
@Pipe({ name: 'localized', pure: false })
export class LocalizedFormatPipe implements PipeTransform {
  private readonly language = inject(LanguageService);
  transform(
    value: number | string | null | undefined,
    type: 'money' | 'date' | 'time' | 'number' = 'money',
    fixedLocale?: 'es-PE' | 'en-US',
  ): string {
    if (value === null || value === undefined) return '—';
    const locale = fixedLocale ?? (this.language.current() === 'es' ? 'es-PE' : 'en-US');
    if (type === 'money')
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'PEN',
      }).format(Number(value));
    if (type === 'number')
      return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(Number(value));
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '—';
    if (type === 'time') {
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Lima',
      }).format(date);
    }

    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima',
    }).format(date);
  }
}
