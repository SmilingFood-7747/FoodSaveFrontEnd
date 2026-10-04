import { Account } from '../model/account';
export abstract class AccountRepository {
  abstract findByEmail(email: string): Account | undefined;
  abstract get(id: number): Account | undefined;
  abstract save(account: Account): void;
}
