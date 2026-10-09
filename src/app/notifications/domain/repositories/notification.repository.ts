import { Notification } from '../model/notification';
export abstract class NotificationRepository {
  abstract all(): Notification[];
  abstract save(notification: Notification): Promise<void>;
}
