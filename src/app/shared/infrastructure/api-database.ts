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
interface LocalChange {
  id: number;
  fields: Record<string, unknown>;
  created: boolean;
}
type LocalChanges = Partial<Record<Resource, LocalChange[]>>;

@Injectable({ providedIn: 'root' })
export class ApiDatabase {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.platformProviderApiBaseUrl.replace(/\/$/, '');
  private readonly localKey = `foodsave-local-changes-v1:${this.baseUrl}`;
  private localChanges: LocalChanges = this.restoreChanges();
  private source?: DatabaseSnapshot;
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
        const requests = Object.fromEntries(
          Object.entries(endpoints).map(([resource, path]) => [
            resource,
            this.http.get<ApiRow[]>(this.baseUrl + path).pipe(timeout(60000)),
          ]),
        );
        const data = await firstValueFrom(forkJoin(requests));
        if (Object.values(data).some((rows) => !Array.isArray(rows)))
          throw new Error('Invalid API response');
        const preferences: Record<string, NotificationPreferences> = {};
        for (const { id, accountId, ...preference } of data[
          'preferences'
        ] as unknown as PreferenceRow[]) {
          preferences[accountId] = preference;
        }
        const source = { ...data, preferences } as unknown as DatabaseSnapshot;
        const merged = this.merge(source);
        this.source = source;
        this.state.set(merged);
        this.ready.set(true);
        this.error.set('');
      } catch {
        this.error.set('errors.apiLoad');
      } finally {
        this.loading.set(false);
      }
    });
  }

  // User actions belong to this browser. The fake API is only accessed with GET.
  commit(change: (current: DatabaseSnapshot) => DatabaseSnapshot): Promise<void> {
    return this.enqueue(async () => {
      if (!this.ready() || !this.source) throw new DomainError('errors.apiLoad');
      const next = change(structuredClone(this.state()));
      const overrides: LocalChanges = {};
      for (const resource of Object.keys(endpoints) as Resource[]) {
        const original = new Map(this.rows(resource, this.source).map((row) => [row.id, row]));
        const changes: LocalChange[] = [];
        for (const row of this.rows(resource, next)) {
          const before = original.get(row.id);
          const fields = before ? this.diff(before, row) : row;
          if (Object.keys(fields).length) {
            changes.push({ id: row.id, fields, created: !before });
          }
        }
        if (changes.length) overrides[resource] = changes;
      }
      this.saving.set(true);
      try {
        localStorage.setItem(this.localKey, JSON.stringify(overrides));
        this.localChanges = overrides;
        this.state.set(next);
        // A local save cannot clear an unrelated API refresh failure.
        if (this.error() === 'errors.localSave') this.error.set('');
      } catch {
        this.error.set('errors.localSave');
        throw new DomainError('errors.localSave');
      } finally {
        this.saving.set(false);
      }
    });
  }

  private merge(source: DatabaseSnapshot): DatabaseSnapshot {
    const merged: Record<string, unknown> = {};
    for (const resource of Object.keys(endpoints) as Resource[]) {
      const rows = new Map(this.rows(resource, source).map((row) => [row.id, row]));
      for (const change of this.localChanges[resource] ?? []) {
        const remote = rows.get(change.id);
        // Local edits apply only to their source record; locally created records remain available.
        if (remote || change.created) {
          rows.set(change.id, { ...remote, ...change.fields, id: change.id });
        }
      }
      merged[resource] =
        resource === 'preferences'
          ? Object.fromEntries([...rows.values()].map(({ id, ...preference }) => [id, preference]))
          : [...rows.values()];
    }
    return merged as unknown as DatabaseSnapshot;
  }

  private rows(resource: Resource, snapshot: DatabaseSnapshot): ApiRow[] {
    if (resource !== 'preferences') return snapshot[resource] as unknown as ApiRow[];
    return Object.entries(snapshot.preferences).map(([accountId, preference]) => ({
      ...preference,
      id: Number(accountId),
    }));
  }

  private diff(before: ApiRow, next: ApiRow): Record<string, unknown> {
    return Object.fromEntries(
      [...new Set([...Object.keys(before), ...Object.keys(next)])]
        .filter((key) => key !== 'id' && !this.equal(before[key], next[key]))
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

  private restoreChanges(): LocalChanges {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(this.localKey) ?? '{}');
      if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
      const valid: LocalChanges = {};
      for (const resource of Object.keys(endpoints) as Resource[]) {
        const changes = (value as LocalChanges)[resource];
        if (!Array.isArray(changes)) continue;
        valid[resource] = changes.filter(
          (change) =>
            change &&
            Number.isSafeInteger(change.id) &&
            typeof change.created === 'boolean' &&
            change.fields &&
            typeof change.fields === 'object' &&
            !Array.isArray(change.fields),
        );
      }
      return valid;
    } catch {
      return {};
    }
  }

  private enqueue<T>(work: () => Promise<T>): Promise<T> {
    const result = this.queue.then(work);
    this.queue = result.catch(() => undefined);
    return result;
  }

  nextId(items: { id: number }[]): number {
    // Keep local demo IDs separate from the API seed's IDs.
    return items.reduce((highest, item) => Math.max(highest, item.id), 1000000000) + 1;
  }
}

export function upsert<T extends { id: number }>(items: T[], item: T): T[] {
  return [...items.filter((current) => current.id !== item.id), item];
}
