import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { UI } from '../../../shared/presentation/ui';
import { SessionService } from '../../application/session.service';
import { NotificationService } from '../../../notifications/application/notification.service';
@Component({
  selector: 'app-profile',
  encapsulation: ViewEncapsulation.None,
  imports: UI,
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './profile.css',
})
export class Profile {
  readonly busy = signal(false);
  readonly session = inject(SessionService);
  readonly notificationService = inject(NotificationService);
  readonly foodCategories = ['meals', 'bakery', 'vegetarian', 'desserts'];
  readonly preferredCategories = signal<string[]>(this.notificationService.preferences().preferredCategories ?? []);
  readonly name = signal(this.session.user()?.fullName ?? '');
  readonly phone = signal(this.nationalNumber(this.session.user()?.phone ?? ''));
  readonly phonePattern = '^[0-9]{9}$';
  readonly message = signal('');

  setPhone(value: string): void {
    this.phone.set(value.replace(/\D/g, '').slice(0, 9));
  }

  async save(): Promise<void> {
    if (this.busy()) return;
    if (this.phone().length !== 9) {
      this.message.set('errors.phone');
      return;
    }
    this.busy.set(true);
    try {
      await this.session.updateProfile(this.name(), `+51${this.phone()}`);
      await this.notificationService.savePreferences({
        ...this.notificationService.preferences(),
        preferredCategories: this.preferredCategories(),
      });
      this.message.set('profile.saved');
    } catch (e) {
      this.message.set(e instanceof Error ? e.message : 'errors.generic');
    } finally {
      this.busy.set(false);
    }
  }

  private nationalNumber(value: string): string {
    const digits = value.replace(/\D/g, '');
    return (digits.startsWith('51') && digits.length === 11 ? digits.slice(2) : digits).slice(0, 9);
  }
}
