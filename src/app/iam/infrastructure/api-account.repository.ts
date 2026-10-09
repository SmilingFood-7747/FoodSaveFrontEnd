import { inject, Injectable } from '@angular/core';
import { AccountRepository } from '../domain/repositories/account.repository';
import { Account } from '../domain/model/account';
import { ApiDatabase, upsert } from '../../shared/infrastructure/api-database';
@Injectable()
export class ApiAccountRepository extends AccountRepository {
  private readonly db = inject(ApiDatabase);
  findByEmail(email: string): Account | undefined {
    return this.db.state().accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
  }
  get(id: number): Account | undefined {
    return this.db.state().accounts.find((a) => a.id === id);
  }
  save(account: Account): Promise<void> {
    return this.db.commit((s) => ({ ...s, accounts: upsert(s.accounts, account) }));
  }
}
