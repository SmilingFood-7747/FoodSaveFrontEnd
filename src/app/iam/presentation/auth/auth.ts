import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UI } from '../../../shared/presentation/ui';
import { SessionService } from '../../application/session.service';
import { AccountRole } from '../../domain/model/account';
@Component({
  selector: 'app-auth',
  encapsulation: ViewEncapsulation.None,
  imports: UI,
  templateUrl: './auth.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './auth.css',
})
export class Auth {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly session = inject(SessionService);
  readonly registering = this.route.snapshot.data['register'] === true;
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly password = signal('');
  readonly confirmPassword = signal('');
  readonly phonePattern = '^[0-9]{9}$';
  readonly role = signal<AccountRole>(
    this.route.snapshot.queryParamMap.get('role') === 'BUSINESS_OWNER'
      ? 'BUSINESS_OWNER'
      : 'CUSTOMER',
  );
  readonly accepted = signal(false);
  readonly error = signal('');
  readonly busy = signal(false);

  setPhone(value: string): void {
    this.phone.set(value.replace(/\D/g, '').slice(0, 9));
  }

  async submit(): Promise<void> {
    if (this.busy()) return;
    this.error.set('');
    this.busy.set(true);
    try {
      if (this.registering) {
        if (!this.accepted()) throw new Error('errors.acceptTerms');
        if (this.phone().length !== 9) throw new Error('errors.phone');
        if (this.password() !== this.confirmPassword()) throw new Error('errors.passwordMismatch');
        await this.session.signUp({
          fullName: `${this.firstName().trim()} ${this.lastName().trim()}`,
          email: this.email(),
          phone: `+51${this.phone()}`,
          password: this.password(),
          role: this.role(),
        });
      } else {
        await this.session.signIn(this.email(), this.password());
      }
      const redirect = this.route.snapshot.queryParamMap.get('redirect');
      const destination =
        redirect?.startsWith('/') && !redirect.startsWith('//')
          ? redirect
          : this.session.isAdmin()
            ? '/admin'
            : this.session.isBusinessOwner()
              ? '/business/dashboard'
              : '/offers';
      await this.router.navigateByUrl(destination);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'errors.generic');
    } finally {
      this.busy.set(false);
    }
  }
}
