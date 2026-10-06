export type AccountRole = 'CUSTOMER' | 'BUSINESS_OWNER' | 'ADMIN';
export interface Account {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: AccountRole;
  passwordHash: string;
  salt: string;
}
export type Session = Omit<Account, 'passwordHash' | 'salt'>;
