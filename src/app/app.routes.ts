import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'offers' },
  {
    path: 'offers',
    loadComponent: () =>
      import('./offers/presentation/catalog/catalog').then((page) => page.Catalog),
  },
  {
    path: 'terms',
    data: { kind: 'terms' },
    loadComponent: () =>
      import('./shared/presentation/pages/legal/legal').then((page) => page.Legal),
  },
  {
    path: 'privacy',
    data: { kind: 'privacy' },
    loadComponent: () =>
      import('./shared/presentation/pages/legal/legal').then((page) => page.Legal),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/presentation/pages/not-found/not-found').then((page) => page.NotFound),
  },
];
