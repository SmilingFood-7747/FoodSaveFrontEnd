import { inject, Injectable } from '@angular/core';
import { AccountRepository } from '../domain/repositories/account.repository';
import { Account } from '../domain/model/account';
import { BrowserDatabase, upsert } from '../../shared/infrastructure/browser-database';
@Injectable()
export class BrowserAccountRepository extends AccountRepository {
  private readonly db = inject(BrowserDatabase);
  findByEmail(email: string): Account | undefined {
    return this.db.state().accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
  }
  get(id: number): Account | undefined {
    return this.db.state().accounts.find((a) => a.id === id);
  }
  save(account: Account): void {
    this.db.commit((s) => ({ ...s, accounts: upsert(s.accounts, account) }));
  }
}
