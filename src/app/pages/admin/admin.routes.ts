
import { Routes } from "@angular/router";
import { AdminLayoutComponent } from "./admin_layout/admin_layout.component";
// ❌ ELIMINADO: Importación circular que causa problemas
// import { routes } from '../../app.routes';
import { adminGuard } from "src/app/guards/admin.guard";

export const AdminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    // canActivateChild: [adminGuard], // Descomentar cuando el guard esté listo
    children: [
      // Para expedientes
      {
        path: 'expedientes',
        loadComponent: () => import('./pages/expedientes-page/expedientes-page.component').then(m => m.ExpedientesPageComponent),
      },
      {
        path: 'expedientes/:id/documentos',
        loadComponent: () => import('./pages/expedientes-page/ver-documentos/ver-documentos.component').then(m => m.VerDocumentosComponent)
      },
      {
        path: 'expedientes/:id/historial',
        loadComponent: () => import('./pages/expedientes-page/ver-historial/ver-historial.component').then(m => m.VerHistorialComponent)
      },

      // Para participe
      { path: 'participes', loadComponent: () => import('./pages/participes-page/participes-page.component').then(m => m.ParticipesPageComponent) },
      { path: 'usuarios', loadComponent: () => import('./pages/usuarios-pages/usuarios-pages.component').then(m => m.UsuariosPagesComponent) },
      { path: 'resoluciones', loadComponent: () => import('./pages/resoluciones-page/resoluciones-page.component').then(m => m.ResolucionesPageComponent) },
      { path: 'auditoria', loadComponent: () => import('./pages/auditoria-page/auditoria-page.component').then(m => m.AuditoriaPageComponent) },
      { path: 'solicitudes', loadComponent: () => import('./pages/solicitudes-page/solicitudes-page.component').then(m => m.SolicitudesPageComponent) },
      { path: '', redirectTo: 'expedientes', pathMatch: 'full' },
    ]
  }
  // ✅ ELIMINADO: No necesita ruta comodín aquí
];

export default AdminRoutes;


// import { Routes } from "@angular/router";
// import { AdminLayoutComponent } from "./admin_layout/admin_layout.component";
// import { routes } from '../../app.routes';
// import { adminGuard } from "src/app/guards/admin.guard";


// export const AdminRoutes: Routes = [
//   {
//     path: '',
//     component: AdminLayoutComponent,
//     // canActivateChild: [adminGuard],
//     children: [
//       // Para expedientes
//       {
//         path: 'expedientes',
//         loadComponent: () => import('./pages/expedientes-page/expedientes-page.component').then(m => m.ExpedientesPageComponent),
//       },
//       {
//         path: 'expedientes/:id/documentos',
//         loadComponent: () => import('./pages/expedientes-page/ver-documentos/ver-documentos.component').then(m => m.VerDocumentosComponent)
//       },
//       {
//         path: 'expedientes/:id/historial',
//         loadComponent: () => import('./pages/expedientes-page/ver-historial/ver-historial.component').then(m => m.VerHistorialComponent)
//       },

//       // Para participe
//       { path: 'participes', loadComponent: () => import('./pages/participes-page/participes-page.component').then(m => m.ParticipesPageComponent) },
//       { path: 'usuarios', loadComponent: () => import('./pages/usuarios-pages/usuarios-pages.component').then(m => m.UsuariosPagesComponent) },
//       { path: 'auditoria', loadComponent: () => import('./pages/auditoria-page/auditoria-page.component').then(m => m.AuditoriaPageComponent) },
//       { path: 'solicitudes', loadComponent: () => import('./pages/solicitudes-page/solicitudes-page.component').then(m => m.SolicitudesPageComponent) },
//       { path: '**', redirectTo: 'expedientes', pathMatch: 'full' },

//     ]
//   },
//   {
//     path: '**',
//     loadComponent: () =>
//       import('../shared/not-found/not-found.component').then(
//         (m) => m.NotFoundComponent
//       ),
//   }
// ]

// export default AdminRoutes;
