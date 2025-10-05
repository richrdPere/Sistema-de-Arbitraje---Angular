import { Routes } from "@angular/router";
import { AdminLayoutComponent } from "./admin_layout/admin_layout.component";

export const AdminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'expedientes', loadComponent: () => import('./pages/expedientes-page/expedientes-page.component').then(m => m.ExpedientesPageComponent) },
      { path: 'participes', loadComponent: () => import('./pages/participes-page/participes-page.component').then(m => m.ParticipesPageComponent) },
      { path: 'usuarios', loadComponent: () => import('./pages/usuarios-pages/usuarios-pages.component').then(m => m.UsuariosPagesComponent) },
      { path: 'auditoria', loadComponent: () => import('./pages/auditoria-page/auditoria-page.component').then(m => m.AuditoriaPageComponent) },
      { path: 'solicitudes', loadComponent: () => import('./pages/solicitudes-page/solicitudes-page.component').then(m => m.SolicitudesPageComponent) },
      { path: '', redirectTo: 'expedientes', pathMatch: 'full' },

      // {
      //   path: 'expedientes',
      //   component: ExpedientesPageComponent
      // },
      // {
      //   path: 'auditoria',
      //   component: AuditoriaPageComponent
      // },
      // {
      //   path: 'participes',
      //   component: ParticipesPageComponent
      // },
      // {
      //   path: 'solicitudes',
      //   component: SolicitudesPageComponent
      // },
      // {
      //   path: 'usuarios',
      //   component: UsuariosPagesComponent
      // }

    ]
  },
  {
    path: '**',
    redirectTo: '',
  }
]

export default AdminRoutes;
