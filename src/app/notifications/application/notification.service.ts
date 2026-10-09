import { computed, effect, inject, Injectable } from '@angular/core';
import { NotificationRepository } from '../domain/repositories/notification.repository';
import { NotificationPreferences } from '../domain/model/notification';
import { ApiDatabase } from '../../shared/infrastructure/api-database';
import { ClockService } from '../../shared/application/clock.service';
import { SessionService } from '../../iam/application/session.service';
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private reminding = false;
  private readonly repository = inject(NotificationRepository);
  private readonly db = inject(ApiDatabase);
  private readonly session = inject(SessionService);
  private readonly clock = inject(ClockService);
  readonly mine = computed(() =>
    this.repository
      .all()
      .filter((n) => n.recipientAccountId === this.session.user()?.id)
      .sort((a, b) => b.id - a.id),
  );
  readonly unread = computed(() => this.mine().filter((n) => !n.readAt).length);
  readonly preferences = computed<NotificationPreferences>(
    () =>
      this.db.state().preferences[this.session.user()?.id ?? ''] ?? {
        emailEnabled: false,
        pushEnabled: false,
        remindersEnabled: true,
        nearbyOffersEnabled: true,
      },
  );
  constructor() {
    effect(() => {
      const now = this.clock.now();
      const user = this.session.user();
      const state = this.db.state();
      if (!user || !this.preferences().remindersEnabled) return;
      const pending = state.reservations.filter(
        (r) =>
          r.customerUserId === user.id &&
          r.status === 'ACTIVE' &&
          Date.parse(r.pickupDeadlineAt) > now &&
          Date.parse(r.pickupDeadlineAt) - now < 3600000 &&
          !state.notifications.some(
            (n) => n.type === 'PICKUP_REMINDER' && n.reservationId === r.id,
          ),
      );
      if (pending.length && !this.reminding) {
        this.reminding = true;
        void this.db
          .commit((s) => ({
            ...s,
            notifications: [
              ...s.notifications,
              ...pending
                .filter(
                  (r) =>
                    !s.notifications.some(
                      (n) => n.type === 'PICKUP_REMINDER' && n.reservationId === r.id,
                    ),
                )
                .map((r, index) => ({
                  id: this.db.nextId(s.notifications) + index,
                  recipientAccountId: user.id,
                  reservationId: r.id,
                  type: 'PICKUP_REMINDER' as const,
                  titleKey: 'notice.reminder',
                  body: r.pickupCode,
                  createdAt: new Date(now).toISOString(),
                })),
            ],
          }))
          .catch(() => undefined)
          .finally(() => {
            this.reminding = false;
          });
      }
    });
  }
  async recordNearby(
    items: { offerId: number; distanceKm: number; offerVersion: string; body: string }[],
  ): Promise<void> {
    const user = this.session.user();
    if (user?.role !== 'CUSTOMER' || this.preferences().nearbyOffersEnabled === false) return;
    await this.db.commit((state) => {
      const next = [...state.notifications];
      for (const item of items) {
        if (
          next.some(
            (notice) =>
              notice.recipientAccountId === user.id &&
              notice.type === 'NEARBY_OFFER' &&
              notice.offerId === item.offerId &&
              notice.offerVersion === item.offerVersion,
          )
        )
          continue;
        next.push({
          ...item,
          id: this.db.nextId(next),
          recipientAccountId: user.id,
          type: 'NEARBY_OFFER',
          titleKey: 'nearby.title',
          createdAt: new Date().toISOString(),
        });
      }
      return { ...state, notifications: next };
    });
  }
  async markRead(id: number): Promise<void> {
    const n = this.mine().find((n) => n.id === id);
    if (n) await this.repository.save({ ...n, readAt: new Date().toISOString() });
  }
  async savePreferences(preferences: NotificationPreferences): Promise<void> {
    const user = this.session.require();
    await this.db.commit((s) => ({
      ...s,
      preferences: { ...s.preferences, [user.id]: preferences },
    }));
  }
}
