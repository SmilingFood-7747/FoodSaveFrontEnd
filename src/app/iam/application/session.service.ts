import { computed, inject, Injectable, signal } from '@angular/core';
import { AccountRepository } from '../domain/repositories/account.repository';
import { AccountRole, Session } from '../domain/model/account';
import { DomainError } from '../../shared/domain/model/domain-error';
import { ApiDatabase } from '../../shared/infrastructure/api-database';
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly repository = inject(AccountRepository);
  private readonly db = inject(ApiDatabase);
  readonly user = signal<Session | null>(this.restore());
  readonly isBusinessOwner = computed(() => this.user()?.role === 'BUSINESS_OWNER');
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');
  private restore(): Session | null {
    try {
      const id = Number(sessionStorage.getItem('foodsave-api-session'));
      const account = this.repository.get(id);
      return account ? this.publicAccount(account) : null;
    } catch {
      return null;
    }
  }
  private publicAccount(account: Session): Session {
    return {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
      role: account.role,
    };
  }
  private async hash(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
      'deriveBits',
    ]);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 120000, hash: 'SHA-256' },
      key,
      256,
    );
    return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  async signIn(email: string, password: string): Promise<void> {
    await this.db.refresh();
    if (this.db.error()) throw new DomainError('errors.apiLoad');
    const account = this.repository.findByEmail(email.trim());
    if (!account) throw new DomainError('errors.credentials');
    const hash = await this.hash(password, account.salt);
    if (account.passwordHash ? hash !== account.passwordHash : password !== 'FoodSave123!')
      throw new DomainError('errors.credentials');
    if (!account.passwordHash) await this.repository.save({ ...account, passwordHash: hash });
    this.establish(this.publicAccount(account));
  }
  async signUp(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: AccountRole;
  }): Promise<void> {
    if (data.role !== 'CUSTOMER' && data.role !== 'BUSINESS_OWNER')
      throw new DomainError('errors.forbidden');
    if (
      !data.fullName.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
      data.password.length < 8
    )
      throw new DomainError('errors.account');
    await this.db.refresh();
    if (this.db.error()) throw new DomainError('errors.apiLoad');
    if (this.repository.findByEmail(data.email)) throw new DomainError('errors.emailExists');
    const salt = crypto.randomUUID();
    const passwordHash = await this.hash(data.password, salt);
    if (this.repository.findByEmail(data.email.trim())) throw new DomainError('errors.emailExists');
    const account = {
      id: this.db.nextId(this.db.state().accounts),
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      role: data.role,
      salt,
      passwordHash,
    };
    await this.repository.save(account);
    this.establish(this.publicAccount(account));
  }
  async updateProfile(fullName: string, phone: string): Promise<void> {
    const user = this.require();
    if (!fullName.trim()) throw new DomainError('errors.required');
    const account = this.repository.get(user.id);
    if (!account) throw new DomainError('errors.credentials');
    await this.repository.save({ ...account, fullName: fullName.trim(), phone: phone.trim() });
    this.establish({ ...user, fullName: fullName.trim(), phone: phone.trim() });
  }
  require(role?: AccountRole): Session {
    const user = this.user();
    if (!user) throw new DomainError('errors.signIn');
    if (role && user.role !== role) throw new DomainError('errors.forbidden');
    return user;
  }
  private establish(user: Session): void {
    this.user.set(user);
    try {
      sessionStorage.setItem('foodsave-api-session', String(user.id));
    } catch {}
  }
  signOut(): void {
    this.user.set(null);
    try {
      sessionStorage.removeItem('foodsave-api-session');
    } catch {}
  }
}
