import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout.component';

export const routes: Routes = [

  // --- Layout publico ----
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./pages/auth/home/home.component').then(m => m.HomeComponent) },
      { path: 'about', loadComponent: () => import('./pages/auth/about/about.component').then(m => m.AboutComponent) },
      {
        path: 'servicios',
        loadComponent: () => import('./pages/auth/servicios/servicios.component').then(m => m.ServiciosComponent),
      },
      {
        path: 'ser_mesa_partes',
        loadComponent: () => import('./pages/auth/servicios/mesa_partes/mesa_partes.component').then(m => m.MesaPartesComponent)
      },
      {
        path: 'ser_consulta_expedientes',
        loadComponent: () => import('./pages/auth/servicios/consulta_expedientes/consulta_expedientes.component').then(m => m.ConsultaExpedientesComponent)
      },
      {
        path: 'ser_calculadora',
        loadComponent: () => import('./pages/auth/servicios/calculadora/calculadora.component').then(m => m.CalculadoraComponent)
      },
      {
        path: 'laudos',
        loadComponent: () => import('./pages/auth/laudos/laudos.component').then(m => m.LaudosComponent),
      },
      {
        path: 'trazabilidad',
        loadComponent: () => import('./pages/auth/trazabilidad/trazabilidad.component').then(m => m.TrazabilidadComponent),
      },
      { path: 'contacto', loadComponent: () => import('./pages/auth/contactos/contactos.component').then(m => m.ContactosComponent) },
      { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
      // { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },

    ],
  },

  // --- Layout Admin (rutas privadas, lazy loading)
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes'),
  },
  {
    path: 'secretaria',
    loadChildren: () => import('./pages/secretaria/secretaria.routes'),
  },

  // --- Página no encontrada ---
  {
    path: '**',
    loadComponent: () =>
      import('./pages/shared/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
