import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccountRole, Session } from '../domain/model/account';

export interface AuthenticatedSession {
  accessToken: string;
  tokenType: string;
  account: Session;
}

export interface SignUpPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: AccountRole;
}

@Injectable({ providedIn: 'root' })
export class BackendAuthApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.foodsaveBackendBaseUrl.replace(/\/$/, '');

  signUp(payload: SignUpPayload): Promise<Session> {
    return firstValueFrom(this.http.post<Session>(`${this.baseUrl}/auth/signup`, payload));
  }

  signIn(email: string, password: string): Promise<AuthenticatedSession> {
    return firstValueFrom(this.http.post<AuthenticatedSession>(`${this.baseUrl}/auth/signin`, { email, password }));
  }

  updateProfile(accountId: number, token: string, fullName: string, phone: string): Promise<Session> {
    return firstValueFrom(this.http.patch<Session>(
      `${this.baseUrl}/api/users/${accountId}/profile`,
      { fullName, phone },
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) },
    ));
  }
}

export function authErrorCode(error: unknown, action: 'signIn' | 'signUp' | 'profile'): string {
  if (!(error instanceof HttpErrorResponse) || error.status === 0) return 'errors.backendUnavailable';
  if (action === 'signIn' && (error.status === 400 || error.status === 401)) return 'errors.credentials';
  if (action === 'signUp' && error.status === 400) {
    const detail = String(error.error?.detail ?? '').toLowerCase();
    return detail.includes('email') || detail.includes('correo') ? 'errors.emailExists' : 'errors.account';
  }
  if (error.status === 403) return 'errors.forbidden';
  if (error.status === 404) return 'errors.credentials';
  return action === 'profile' ? 'errors.account' : 'errors.generic';
}
