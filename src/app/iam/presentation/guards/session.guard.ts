import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../../application/session.service';
export const sessionGuard: CanActivateFn = (_, state) =>
  inject(SessionService).user()
    ? true
    : inject(Router).createUrlTree(['/sign-in'], { queryParams: { redirect: state.url } });
export const ownerGuard: CanActivateFn = (_, state) => {
  const session = inject(SessionService),
    router = inject(Router);
  if (!session.user())
    return router.createUrlTree(['/sign-in'], {
      queryParams: { redirect: state.url, role: 'BUSINESS_OWNER' },
    });
  return session.isBusinessOwner() ? true : router.createUrlTree(['/offers']);
};

export const adminGuard: CanActivateFn = (_, state) => {
  const session = inject(SessionService);
  const router = inject(Router);
  if (!session.user())
    return router.createUrlTree(['/sign-in'], { queryParams: { redirect: state.url } });
  return session.isAdmin() ? true : router.createUrlTree(['/offers']);
};
