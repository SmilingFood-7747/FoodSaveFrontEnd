import { inject, Injectable } from '@angular/core';
import { NotificationRepository } from '../domain/repositories/notification.repository';
import { Notification } from '../domain/model/notification';
import { BrowserDatabase, upsert } from '../../shared/infrastructure/browser-database';
@Injectable()
export class BrowserNotificationRepository extends NotificationRepository {
  private readonly db = inject(BrowserDatabase);
  all(): Notification[] {
    return this.db.state().notifications;
  }
  save(notification: Notification): void {
    this.db.commit((s) => ({ ...s, notifications: upsert(s.notifications, notification) }));
  }
}
