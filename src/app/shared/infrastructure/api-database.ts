import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, forkJoin, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account } from '../../iam/domain/model/account';
import { Business } from '../../businesses/domain/model/business';
import { OfferData } from '../../offers/domain/model/offer';
import { ReservationData } from '../../reservations/domain/model/reservation';
import {
  Notification,
  NotificationPreferences,
} from '../../notifications/domain/model/notification';
import { Review, SupportRequest } from '../../feedback/domain/model/review';
import { Subscription, SubscriptionCharge } from '../../billing/domain/model/subscription';
import { DomainError } from '../domain/model/domain-error';

export interface DatabaseSnapshot {
  accounts: Account[];
  businesses: Business[];
  offers: OfferData[];
  reservations: ReservationData[];
  notifications: Notification[];
  reviews: Review[];
  requests: SupportRequest[];
  subscriptions: Subscription[];
  subscriptionCharges: SubscriptionCharge[];
  preferences: Record<string, NotificationPreferences>;
}

const endpoints = {
  accounts: environment.platformProviderAccountsEndpointPath,
  businesses: environment.platformProviderBusinessesEndpointPath,
  offers: environment.platformProviderOffersEndpointPath,
  reservations: environment.platformProviderReservationsEndpointPath,
  notifications: environment.platformProviderNotificationsEndpointPath,
  reviews: environment.platformProviderReviewsEndpointPath,
  requests: environment.platformProviderRequestsEndpointPath,
  subscriptions: environment.platformProviderSubscriptionsEndpointPath,
  subscriptionCharges: environment.platformProviderSubscriptionChargesEndpointPath,
  preferences: environment.platformProviderPreferencesEndpointPath,
};
type Resource = keyof typeof endpoints;
type ApiRow = { id: number; [key: string]: unknown };
type PreferenceRow = NotificationPreferences & { id: number; accountId: number };
interface Change {
  resource: Resource;
  previous?: ApiRow;
  next: ApiRow;
}

@Injectable({ providedIn: 'root' })
export class ApiDatabase {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.platformProviderApiBaseUrl.replace(/\/$/, '');
  private preferenceRows: PreferenceRow[] = [];
  private queue: Promise<unknown> = Promise.resolve();
  readonly state = signal<DatabaseSnapshot>({
    accounts: [],
    businesses: [],
    offers: [],
    reservations: [],
    notifications: [],
    reviews: [],
    requests: [],
    subscriptions: [],
    subscriptionCharges: [],
    preferences: {},
  });
  readonly ready = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');

  async initialize(): Promise<void> {
    await this.refresh();
  }

  refresh(): Promise<void> {
    return this.enqueue(async () => {
      this.loading.set(true);
      try {
        await this.load();
        this.error.set('');
      } catch {
        this.error.set('errors.apiLoad');
      } finally {
        this.loading.set(false);
      }
    });
  }

  private async load(): Promise<void> {
    const requests = Object.fromEntries(
      Object.entries(endpoints).map(([resource, path]) => [
        resource,
        this.http.get<ApiRow[]>(this.baseUrl + path).pipe(timeout(60000)),
      ]),
    );
    const data = await firstValueFrom(forkJoin(requests));
    if (Object.values(data).some((rows) => !Array.isArray(rows)))
      throw new Error('Invalid API response');
    this.preferenceRows = data['preferences'] as unknown as PreferenceRow[];
    const preferences: Record<string, NotificationPreferences> = {};
    for (const { id, accountId, ...preference } of this.preferenceRows) {
      preferences[accountId] = preference;
    }
    this.state.set({ ...data, preferences } as unknown as DatabaseSnapshot);
    this.ready.set(true);
  }

  commit(change: (current: DatabaseSnapshot) => DatabaseSnapshot): Promise<void> {
    return this.enqueue(async () => {
      if (!this.ready()) throw new DomainError('errors.apiLoad');
      const previous = this.state();
      // Normalize optional fields in the same way as a JSON HTTP request.
      const next: DatabaseSnapshot = JSON.parse(JSON.stringify(change(structuredClone(previous))));
      const changes = this.changes(previous, next);
      if (!changes.length) return;
      const applied: Change[] = [];
      this.saving.set(true);
      try {
        // Detect edits made by another client before sending this batch.
        for (const item of changes) {
          const rows = await firstValueFrom(
            this.http
              .get<ApiRow[]>(this.url(item.resource), {
                params: { id: item.next.id },
              })
              .pipe(timeout(15000)),
          );
          const remote = rows[0];
          if (item.previous ? !remote || !this.equal(remote, item.previous) : !!remote)
            throw new DomainError('errors.apiConflict');
        }
        for (const item of changes) {
          if (item.previous) {
            await firstValueFrom(
              this.http
                .patch(this.url(item.resource, item.next.id), this.patch(item.previous, item.next))
                .pipe(timeout(15000)),
            );
          } else {
            await firstValueFrom(
              this.http.post(this.url(item.resource), item.next).pipe(timeout(15000)),
            );
          }
          applied.push(item);
        }
        this.state.set(next);
        this.preferenceRows = this.rows('preferences', next) as unknown as PreferenceRow[];
        try {
          await this.load();
          this.error.set('');
        } catch {
          // Writes were confirmed; a refresh failure must not invite a duplicate submission.
          this.error.set('errors.apiLoad');
        }
      } catch (cause) {
        // JSON Server has no transactions. Undo confirmed steps on a failed batch.
        for (const item of applied.reverse()) {
          try {
            const remote = await firstValueFrom(
              this.http.get<ApiRow>(this.url(item.resource, item.next.id)).pipe(timeout(15000)),
            );
            // Preserve subsequent edits from other clients during compensation.
            const expected = item.previous
              ? { ...item.previous, ...this.patch(item.previous, item.next) }
              : item.next;
            if (!this.equal(remote, expected)) continue;
            if (item.previous) {
              await firstValueFrom(
                this.http
                  .patch(
                    this.url(item.resource, item.next.id),
                    this.patch(item.next, item.previous),
                  )
                  .pipe(timeout(15000)),
              );
            } else {
              await firstValueFrom(
                this.http.delete(this.url(item.resource, item.next.id)).pipe(timeout(15000)),
              );
            }
          } catch {
            /* Reload the server state below if compensation fails. */
          }
        }
        try {
          await this.load();
        } catch {
          /* Keep the last confirmed snapshot. */
        }
        const key = cause instanceof DomainError ? cause.key : 'errors.apiSave';
        this.error.set(key);
        throw new DomainError(key);
      } finally {
        this.saving.set(false);
      }
    });
  }

  private changes(previous: DatabaseSnapshot, next: DatabaseSnapshot): Change[] {
    const changes: Change[] = [];
    for (const resource of Object.keys(endpoints) as Resource[]) {
      const before = new Map(this.rows(resource, previous).map((row) => [row.id, row]));
      for (const row of this.rows(resource, next)) {
        const old = before.get(row.id);
        if (!old || !this.equal(old, row)) changes.push({ resource, previous: old, next: row });
      }
    }
    return changes;
  }

  private rows(resource: Resource, snapshot: DatabaseSnapshot): ApiRow[] {
    if (resource !== 'preferences') return snapshot[resource] as unknown as ApiRow[];
    let nextId = this.nextId(this.preferenceRows);
    return Object.entries(snapshot.preferences).map(([accountId, preferences]) => ({
      ...preferences,
      accountId: Number(accountId),
      id: this.preferenceRows.find((row) => row.accountId === Number(accountId))?.id ?? nextId++,
    }));
  }

  private patch(previous: ApiRow, next: ApiRow): Record<string, unknown> {
    return Object.fromEntries(
      [...new Set([...Object.keys(previous), ...Object.keys(next)])]
        .filter((key) => key !== 'id' && !this.equal(previous[key], next[key]))
        .map((key) => [key, next[key] ?? null]),
    );
  }

  private equal(a: unknown, b: unknown): boolean {
    const canonical = (value: unknown): string =>
      JSON.stringify(value, (_key, item) =>
        item && typeof item === 'object' && !Array.isArray(item)
          ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
          : item,
      );
    return canonical(a) === canonical(b);
  }

  private url(resource: Resource, id?: number): string {
    return this.baseUrl + endpoints[resource] + (id === undefined ? '' : `/${id}`);
  }

  private enqueue<T>(work: () => Promise<T>): Promise<T> {
    const result = this.queue.then(work);
    this.queue = result.catch(() => undefined);
    return result;
  }

  nextId(items: { id: number }[]): number {
    return items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;
  }
}

export function upsert<T extends { id: number }>(items: T[], item: T): T[] {
  return [...items.filter((current) => current.id !== item.id), item];
}
