import { Routes } from '@angular/router';
import { LayoutComponentMain } from './layout/main/layout_main/layout_main.component';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // =========================================================
  // Layout público
  // =========================================================
  {
    path: '',
    // loadChildren: () => import('./layout/main/main.routes'),
    loadChildren: () => import('./pages/public/public.routes'),
  },



  // =========================================================
  // Layout auth
  // =========================================================
  {
    path: 'auth',
    // loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(
    //   (component) =>
    //     component.AuthLayoutComponent,
    // ),

    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login-page/login-page.component').then(
            (component) =>
              component.LoginPageComponent,
          ),
      },
    ],
  },


  // =========================================================
  // Layout admin
  // =========================================================
  // --- Layout Admin (rutas privadas, lazy loading)
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'SECRETARIA', 'ARBITRO', 'PARTICIPE', 'ADJUDICADOR'] },
    loadChildren: () => import('./pages/features/features.routes'),
  },

  // =========================================================
  // Acceso denegado
  // =========================================================
  {
    path: 'acceso-denegado',
    loadComponent: () => import('./shared/pages/access-denied/access-denied.component').then(
      m => m.AccessDeniedComponent),
  },

  // =========================================================
  // Página no encontrada
  // =========================================================
  {
    path: '**',
    loadComponent: () => import('./shared/pages/no-found-page/no-found-page.component').then(
      (m) => m.NoFoundPageComponent
    ),
  },
];
