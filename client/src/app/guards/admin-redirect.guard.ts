import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminRedirectGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();

  if (user?.role === 'admin') {
    router.navigate(['/admin/dashboard']);
    return false;
  }
  return true;
};