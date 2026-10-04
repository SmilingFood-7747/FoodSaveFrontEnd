import { DestroyRef, Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ClockService {
  readonly now = signal(Date.now());
  constructor(destroy: DestroyRef) {
    const timer = setInterval(() => this.now.set(Date.now()), 15000);
    destroy.onDestroy(() => clearInterval(timer));
  }
}
