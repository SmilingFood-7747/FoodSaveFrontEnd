import { Account } from '../domain/model/account';

export function createDemoAccounts(): Account[] {
  const accounts: Account[] = [
    {
      id: 1,
      fullName: 'Andrea Mendoza',
      email: 'cliente@gmail.com',
      phone: '999111222',
      role: 'CUSTOMER',
      passwordHash: '',
      salt: 'foodsave-demo-customer',
    },
    {
      id: 2,
      fullName: 'Carlos Guevara',
      email: 'negocio@gmail.com',
      phone: '999333444',
      role: 'BUSINESS_OWNER',
      passwordHash: '',
      salt: 'foodsave-demo-business',
    },
    {
      id: 100,
      fullName: 'Lucía Torres',
      email: 'pan@gmail.com',
      phone: '999444555',
      role: 'BUSINESS_OWNER',
      passwordHash: '',
      salt: 'foodsave-demo-bakery',
    },
    {
      id: 101,
      fullName: 'Diego Ramos',
      email: 'sazon@gmail.com',
      phone: '999555666',
      role: 'BUSINESS_OWNER',
      passwordHash: '',
      salt: 'foodsave-demo-meals',
    },
    {
      id: 102,
      fullName: 'María Rojas',
      email: 'verde@gmail.com',
      phone: '999777888',
      role: 'BUSINESS_OWNER',
      passwordHash: '',
      salt: 'foodsave-demo-salad',
    },
  ];
  return accounts;
}
