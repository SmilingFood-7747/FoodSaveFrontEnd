import { DestroyRef, inject, Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class GeolocationService {
  readonly position = signal<{ latitude: number; longitude: number } | null>(null);
  readonly locating = signal(false);
  private watcher: number | null = null;
  private pending: Promise<void> | null = null;
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.watcher !== null) navigator.geolocation.clearWatch(this.watcher);
    });
  }
  async resumeIfGranted(): Promise<void> {
    try {
      if (
        navigator.permissions &&
        (await navigator.permissions.query({ name: 'geolocation' })).state === 'granted'
      )
        await this.locate();
    } catch {}
  }
  locate(): Promise<void> {
    if (this.pending) return this.pending;
    this.locating.set(true);
    const request = new Promise<void>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('errors.location'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (point) => {
          this.position.set({ latitude: point.coords.latitude, longitude: point.coords.longitude });
          if (this.watcher === null)
            this.watcher = navigator.geolocation.watchPosition(
              (updated) =>
                this.position.set({
                  latitude: updated.coords.latitude,
                  longitude: updated.coords.longitude,
                }),
              (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                  this.position.set(null);
                  if (this.watcher !== null) navigator.geolocation.clearWatch(this.watcher);
                  this.watcher = null;
                }
              },
              { maximumAge: 60000, timeout: 10000 },
            );
          resolve();
        },
        () => reject(new Error('errors.location')),
        { timeout: 10000, maximumAge: 60000 },
      );
    });
    this.pending = request.finally(() => {
      this.locating.set(false);
      this.pending = null;
    });
    return this.pending;
  }
  distance(latitude: number, longitude: number): number | null {
    const position = this.position();
    if (!position || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    const rad = (value: number) => (value * Math.PI) / 180;
    const a =
      Math.sin(rad(latitude - position.latitude) / 2) ** 2 +
      Math.cos(rad(position.latitude)) *
        Math.cos(rad(latitude)) *
        Math.sin(rad(longitude - position.longitude) / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  }
}
