import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'offers' },
  {
    path: 'offers',
    loadComponent: () =>
      import('./offers/presentation/catalog/catalog').then((page) => page.Catalog),
  },
];
