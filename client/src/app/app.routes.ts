import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products').then(m => m.ProductsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then(m => m.ProductDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-requests',
    loadComponent: () =>
      import('./pages/my-requests/my-requests').then(m => m.MyRequestsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/dashboard',
    loadComponent: () =>
      import('./pages/admin/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/products',
    loadComponent: () =>
      import('./pages/admin/manage-products/manage-products').then(m => m.ManageProductsComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/categories',
    loadComponent: () =>
      import('./pages/admin/manage-categories/manage-categories').then(m => m.ManageCategoriesComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/requests',
    loadComponent: () =>
      import('./pages/admin/manage-requests/manage-requests').then(m => m.ManageRequestsComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./pages/admin/manage-users/manage-users').then(m => m.ManageUsersComponent),
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: '' }
];