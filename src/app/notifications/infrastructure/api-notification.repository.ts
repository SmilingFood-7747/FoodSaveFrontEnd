import { inject, Injectable } from '@angular/core';
import { NotificationRepository } from '../domain/repositories/notification.repository';
import { Notification } from '../domain/model/notification';
import { ApiDatabase, upsert } from '../../shared/infrastructure/api-database';
@Injectable()
export class ApiNotificationRepository extends NotificationRepository {
  private readonly db = inject(ApiDatabase);
  all(): Notification[] {
    return this.db.state().notifications;
  }
  save(notification: Notification): Promise<void> {
    return this.db.commit((s) => ({ ...s, notifications: upsert(s.notifications, notification) }));
  }
}
