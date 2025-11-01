import { Routes } from "@angular/router";
import { adminGuard } from "src/app/guards/admin.guard";
import { ParticipeLayoutComponent } from "./participe_layout/participe_layout.component";

export const ParticipeRoutes: Routes = [
  {
    path: '',
    component: ParticipeLayoutComponent,
    // canActivateChild: [adminGuard], // Descomentar cuando el guard esté listo
    children: [
      // Para expedientes
      {
        path: 'expedientes',
        loadComponent: () => import('./pages/expediente/expediente.component').then(m => m.ExpedienteComponent),
      },
      // {
      //   path: 'expedientes/:id/documentos',
      //   loadComponent: () => import('./pages/expedientes-page/ver-documentos/ver-documentos.component').then(m => m.VerDocumentosComponent)
      // },
      // {
      //   path: 'expedientes/:id/historial',
      //   loadComponent: () => import('./pages/expedientes-page/ver-historial/ver-historial.component').then(m => m.VerHistorialComponent)
      // },

      { path: 'resoluciones', loadComponent: () => import('./pages/resolucion/resolucion.component').then(m => m.ResolucionComponent) },
      { path: 'auditoria', loadComponent: () => import('./pages/auditoria/auditoria.component').then(m => m.AuditoriaComponent) },

      { path: '', redirectTo: 'expedientes', pathMatch: 'full' },
    ]
  }
];

export default ParticipeRoutes;
