import { computed, effect, inject, Injectable } from '@angular/core';
import { NotificationRepository } from '../domain/repositories/notification.repository';
import { NotificationPreferences } from '../domain/model/notification';
import { BrowserDatabase } from '../../shared/infrastructure/browser-database';
import { ClockService } from '../../shared/application/clock.service';
import { SessionService } from '../../iam/application/session.service';
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly repository = inject(NotificationRepository);
  private readonly db = inject(BrowserDatabase);
  private readonly session = inject(SessionService);
  private readonly clock = inject(ClockService);
  readonly mine = computed(() =>
    this.repository
      .all()
      .filter((n) => n.recipientAccountId === this.session.user()?.id)
      .sort((a, b) => b.id - a.id),
  );
  readonly unread = computed(() => this.mine().filter((n) => !n.readAt).length);
  readonly preferences = computed(
    () =>
      this.db.state().preferences[this.session.user()?.id ?? ''] ?? {
        emailEnabled: false,
        pushEnabled: false,
        remindersEnabled: true,
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
      if (pending.length)
        this.db.commit((s) => ({
          ...s,
          notifications: [
            ...s.notifications,
            ...pending.map((r, index) => ({
              id: this.db.nextId(s.notifications) + index,
              recipientAccountId: user.id,
              reservationId: r.id,
              type: 'PICKUP_REMINDER' as const,
              titleKey: 'notice.reminder',
              body: r.pickupCode,
              createdAt: new Date(now).toISOString(),
            })),
          ],
        }));
    });
  }
  markRead(id: number): void {
    const n = this.mine().find((n) => n.id === id);
    if (n) this.repository.save({ ...n, readAt: new Date().toISOString() });
  }
  savePreferences(preferences: NotificationPreferences): void {
    const user = this.session.require();
    this.db.commit((s) => ({ ...s, preferences: { ...s.preferences, [user.id]: preferences } }));
  }
}
