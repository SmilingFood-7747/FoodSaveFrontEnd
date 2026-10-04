import { Component, inject, signal } from '@angular/core';
import { UI } from '../../../shared/presentation/ui';
import { SessionService } from '../../application/session.service';
@Component({
  selector: 'app-profile',
  imports: UI,
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  readonly session = inject(SessionService);
  readonly name = signal(this.session.user()?.fullName ?? '');
  readonly phone = signal(this.session.user()?.phone ?? '');
  readonly message = signal('');
  save(): void {
    try {
      this.session.updateProfile(this.name(), this.phone());
      this.message.set('profile.saved');
    } catch (e) {
      this.message.set(e instanceof Error ? e.message : 'errors.generic');
    }
  }
}
