import { Routes } from '@angular/router';
import { LayoutComponentMain } from './layout/main/layout_main/layout_main.component';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  // --- Layout publico ----
  {
    path: '',
    loadChildren: () => import('./layout/main/main.routes'),
  },

  // --- Layout Admin (rutas privadas, lazy loading)
  {
    path: 'app',
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'secretaria', 'arbitro', 'participe', 'adjudicador'] },
    loadChildren: () => import('./layout/trazabilidad/trazabilidad.routes'),
  },


  // ✅ CORREGIDO: ÚNICA ruta comodín en toda la aplicación
  {
    path: '**',
    loadComponent: () =>
      import('./pages/shared/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];



  // {
  //   path: 'admin',
  //   loadChildren: () => import('./pages/admin/admin.routes'),
  // },
  // {
  //   path: 'secretaria',
  //   loadChildren: () => import('./pages/secretaria/secretaria.routes'),
  // },
  // {
  //   path: 'participe',
  //   loadChildren: () => import('./pages/participe/participe.routes'),
  // },
  // {
  //   path: 'arbitro',
  //   loadChildren: () => import('./pages/arbitro/arbitro.routes'),
  // },
  // {
  //   path: 'adjudicador',
  //   loadChildren: () => import('./pages/adjudicador/adjudicador.routes'),
  // },
