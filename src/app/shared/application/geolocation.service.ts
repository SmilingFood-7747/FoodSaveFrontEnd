import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class GeolocationService {
  readonly position = signal<{ latitude: number; longitude: number } | null>(null);
  readonly locating = signal(false);
  locate(): Promise<void> {
    this.locating.set(true);
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        this.locating.set(false);
        reject(new Error('errors.location'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (p) => {
          this.position.set({ latitude: p.coords.latitude, longitude: p.coords.longitude });
          this.locating.set(false);
          resolve();
        },
        () => {
          this.locating.set(false);
          reject(new Error('errors.location'));
        },
        { timeout: 10000, maximumAge: 60000 },
      );
    });
  }
  distance(latitude: number, longitude: number): number | null {
    const p = this.position();
    if (!p) return null;
    const rad = (n: number) => (n * Math.PI) / 180;
    const a =
      Math.sin(rad(latitude - p.latitude) / 2) ** 2 +
      Math.cos(rad(p.latitude)) *
        Math.cos(rad(latitude)) *
        Math.sin(rad(longitude - p.longitude) / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
