import { computed, inject, Injectable, signal } from '@angular/core';
import { AccountRole, Session } from '../domain/model/account';
import { DomainError } from '../../shared/domain/model/domain-error';
import { authErrorCode, BackendAuthApi } from '../infrastructure/backend-auth.api';
import { BackendCatalogApi } from '../../shared/infrastructure/backend-catalog.api';

const sessionKey = 'foodsave-backend-session';
const tokenKey = 'foodsave-backend-access-token';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly authApi = inject(BackendAuthApi);
  private readonly catalog = inject(BackendCatalogApi);
  readonly user = signal<Session | null>(this.restore());
  private readonly accessTokenValue = signal(this.restoreToken());
  readonly isBusinessOwner = computed(() => this.user()?.role === 'BUSINESS_OWNER');
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  get accessToken(): string | null { return this.accessTokenValue(); }

  private restore(): Session | null {
    try {
      const value = sessionStorage.getItem(sessionKey);
      if (!value) return null;
      const session = JSON.parse(value) as Session;
      return session.id && session.email && session.role ? this.publicAccount(session) : null;
    } catch {
      return null;
    }
  }

  private restoreToken(): string | null {
    try { return sessionStorage.getItem(tokenKey); } catch { return null; }
  }

  private publicAccount(account: Session): Session {
    return { id: account.id, fullName: account.fullName, email: account.email, phone: account.phone, role: account.role };
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const result = await this.authApi.signIn(email.trim(), password);
      const user = this.publicAccount(result.account);
      this.establish(user, result.accessToken);
      await this.catalog.refresh(user, result.accessToken);
    } catch (error) {
      throw new DomainError(authErrorCode(error, 'signIn'));
    }
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
    if (!data.fullName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.password.length < 8)
      throw new DomainError('errors.account');
    if (!/^\+51\d{9}$/.test(data.phone)) throw new DomainError('errors.phone');
    try {
      await this.authApi.signUp({
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        password: data.password,
        role: data.role,
      });
      await this.signIn(data.email, data.password);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw new DomainError(authErrorCode(error, 'signUp'));
    }
  }

  async updateProfile(fullName: string, phone: string): Promise<void> {
    const user = this.require();
    const token = this.accessTokenValue();
    if (!fullName.trim()) throw new DomainError('errors.required');
    if (!token) throw new DomainError('errors.signIn');
    try {
      const updated = await this.authApi.updateProfile(user.id, token, fullName.trim(), phone.trim());
      this.establish(this.publicAccount(updated), token);
    } catch (error) {
      throw new DomainError(authErrorCode(error, 'profile'));
    }
  }

  require(role?: AccountRole): Session {
    const user = this.user();
    if (!user) throw new DomainError('errors.signIn');
    if (role && user.role !== role) throw new DomainError('errors.forbidden');
    return user;
  }

  private establish(user: Session, token: string): void {
    const safeUser = this.publicAccount(user);
    this.user.set(safeUser);
    this.accessTokenValue.set(token);
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(safeUser));
      sessionStorage.setItem(tokenKey, token);
      sessionStorage.removeItem('foodsave-api-session');
    } catch {}
  }

  signOut(): void {
    this.user.set(null);
    this.accessTokenValue.set(null);
    try {
      sessionStorage.removeItem(sessionKey);
      sessionStorage.removeItem(tokenKey);
      sessionStorage.removeItem('foodsave-api-session');
    } catch {}
    void this.catalog.refresh(null, null);
  }
}
