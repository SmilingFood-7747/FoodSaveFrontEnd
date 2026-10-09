import { DestroyRef, inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BrowserImageStorage {
  private connection?: Promise<IDBDatabase>;
  private readonly urls = new Map<string, Promise<string | null>>();
  private readonly objectUrls = new Set<string>();
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
      void this.connection?.then((db) => db.close());
    });
  }
  private open(): Promise<IDBDatabase> {
    return (this.connection ??= new Promise((resolve, reject) => {
      const request = indexedDB.open('foodsave-images', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('images');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('errors.imageStorage'));
      request.onblocked = () => reject(new Error('errors.imageStorage'));
    }));
  }
  async save(file: File): Promise<string> {
    // Store a portable image in the API, within JSON Server's default request limit.
    const image = await createImageBitmap(file);
    try {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 640 / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('errors.imageStorage');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.8, 0.65, 0.5, 0.35, 0.2]) {
        const data = canvas.toDataURL('image/jpeg', quality);
        if (data.length <= 80000) return data;
      }
      throw new Error('errors.imageSize');
    } finally {
      image.close();
    }
  }
  resolve(reference?: string): Promise<string | null> {
    if (!reference) return Promise.resolve(null);
    if (!reference.startsWith('local-image:')) return Promise.resolve(reference);
    let result = this.urls.get(reference);
    if (!result) {
      result = this.open()
        .then(
          (db) =>
            new Promise<string | null>((resolve, reject) => {
              const request = db
                .transaction('images')
                .objectStore('images')
                .get(reference.slice(12));
              request.onsuccess = () => {
                if (!(request.result instanceof Blob)) {
                  resolve(null);
                  return;
                }
                const url = URL.createObjectURL(request.result);
                this.objectUrls.add(url);
                resolve(url);
              };
              request.onerror = () => reject(request.error);
            }),
        )
        .catch(() => null);
      this.urls.set(reference, result);
    }
    return result;
  }
  async remove(reference: string): Promise<void> {
    if (!reference.startsWith('local-image:')) return;
    const db = await this.open();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('images', 'readwrite');
      transaction.objectStore('images').delete(reference.slice(12));
      transaction.oncomplete = () => resolve();
      transaction.onerror = transaction.onabort = () => reject(transaction.error);
    });
  }
}
