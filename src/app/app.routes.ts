import { Routes } from '@angular/router';
import { sessionGuard, ownerGuard, adminGuard } from './iam/presentation/guards/session.guard';
export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/presentation/dashboard/admin-dashboard').then((m) => m.AdminDashboard),
  },
  {
    path: 'plans',
    loadComponent: () => import('./billing/presentation/plans/plans').then((m) => m.Plans),
  },
  { path: '', redirectTo: 'offers', pathMatch: 'full' },
  {
    path: 'offers',
    loadComponent: () => import('./offers/presentation/catalog/catalog').then((m) => m.Catalog),
  },
  {
    path: 'offers/:id',
    loadComponent: () =>
      import('./offers/presentation/offer-detail/offer-detail').then((m) => m.OfferDetail),
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./iam/presentation/auth/auth').then((m) => m.Auth),
  },
  {
    path: 'sign-up',
    data: { register: true },
    loadComponent: () => import('./iam/presentation/auth/auth').then((m) => m.Auth),
  },
  {
    path: 'profile',
    canActivate: [sessionGuard],
    loadComponent: () => import('./iam/presentation/profile/profile').then((m) => m.Profile),
  },
  {
    path: 'reservations',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./reservations/presentation/reservations/reservations').then((m) => m.Reservations),
  },
  {
    path: 'businesses/:id',
    data: { public: true },
    loadComponent: () =>
      import('./businesses/presentation/business-profile/business-profile').then(
        (m) => m.BusinessProfile,
      ),
  },
  {
    path: 'business/dashboard',
    canActivate: [ownerGuard],
    loadComponent: () =>
      import('./businesses/presentation/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'business/profile',
    canActivate: [ownerGuard],
    loadComponent: () =>
      import('./businesses/presentation/business-profile/business-profile').then(
        (m) => m.BusinessProfile,
      ),
  },
  {
    path: 'business/offers',
    canActivate: [ownerGuard],
    loadComponent: () =>
      import('./offers/presentation/manage-offers/manage-offers').then((m) => m.ManageOffers),
  },
  {
    path: 'business/offers/new',
    canActivate: [ownerGuard],
    loadComponent: () =>
      import('./offers/presentation/offer-editor/offer-editor').then((m) => m.OfferEditor),
  },
  {
    path: 'business/offers/:id/edit',
    canActivate: [ownerGuard],
    loadComponent: () =>
      import('./offers/presentation/offer-editor/offer-editor').then((m) => m.OfferEditor),
  },
  {
    path: 'business/reservations',
    data: { business: true },
    canActivate: [ownerGuard],
    loadComponent: () =>
      import('./reservations/presentation/reservations/reservations').then((m) => m.Reservations),
  },
  {
    path: 'notifications',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./notifications/presentation/notifications/notifications').then(
        (m) => m.Notifications,
      ),
  },
  {
    path: 'support',
    loadComponent: () => import('./feedback/presentation/support/support').then((m) => m.Support),
  },
  {
    path: 'terms',
    data: { kind: 'terms' },
    loadComponent: () => import('./shared/presentation/pages/legal/legal').then((m) => m.Legal),
  },
  {
    path: 'privacy',
    data: { kind: 'privacy' },
    loadComponent: () => import('./shared/presentation/pages/legal/legal').then((m) => m.Legal),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/presentation/pages/not-found/not-found').then((m) => m.NotFound),
  },
];
