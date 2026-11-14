import { inject, Injectable } from '@angular/core';
import { NotificationRepository } from '../domain/repositories/notification.repository';
import { Notification } from '../domain/model/notification';
import { ApiDatabase, upsert } from '../../shared/infrastructure/api-database';
import { BackendCatalogApi } from '../../shared/infrastructure/backend-catalog.api';
import { SessionService } from '../../iam/application/session.service';
@Injectable()
export class ApiNotificationRepository extends NotificationRepository {
  private readonly db = inject(ApiDatabase);
  private readonly catalog = inject(BackendCatalogApi);
  private readonly session = inject(SessionService);
  all(): Notification[] {
    const backend = this.catalog.notifications();
    const backendIds = new Set(backend.map((notification) => notification.id));
    const local = this.db.state().notifications.filter(
      (notification) => notification.type === 'NEARBY_OFFER' && !backendIds.has(notification.id),
    );
    return [...backend, ...local];
  }
  save(notification: Notification): Promise<void> {
    if (this.catalog.notifications().some((item) => item.id === notification.id)) {
      const token = this.session.accessToken;
      if (!token) return Promise.reject(new Error('errors.signIn'));
      return this.catalog.markNotificationRead(notification.id, token);
    }
    return this.db.commit((s) => ({ ...s, notifications: upsert(s.notifications, notification) }));
  }
}
