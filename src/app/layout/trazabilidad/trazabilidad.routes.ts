import { Routes } from '@angular/router';
import { LayoutTrazabilidadComponent } from './layout_trazabilidad/layout_trazabilidad.component';

export const trazabilidadRoutes: Routes = [
  // --- Layout trazabilidad ----
  {
    path: '',
    component: LayoutTrazabilidadComponent,
    children: [

      // Para expedientes
      {
        path: 'expedientes',
        loadComponent: () => import('../../pages/modules/expedientes/expedientes.component').then(m => m.ExpedientesComponent),
      },
      {
        path: 'expedientes/:id/documentos',
        loadComponent: () => import('../../pages/modules/expedientes/ver-documentos/ver-documentos.component').then(m => m.VerDocumentosComponent)
      },
       {
        path: 'expedientes/:id/participes',
        loadComponent: () => import('../../pages/modules/expedientes/gestionar-participes/gestionar-participes.component').then(m => m.GestionarParticipesComponent)
      },
      {
        path: 'expedientes/:id/historial',
        loadComponent: () => import('../../pages/modules/expedientes/ver-historial/ver-historial.component').then(m => m.VerHistorialComponent)
      },

      // Para participe

      { path: 'participes', loadComponent: () => import('../../pages/modules/participes/participes.component').then(m => m.ParticipesComponent) },
      { path: 'perfil', loadComponent: () => import('../../pages/modules/perfil/perfil.component').then(m => m.PerfilComponent) },
      { path: 'usuarios', loadComponent: () => import('../../pages/modules/usuarios/usuarios.component').then(m => m.UsuariosComponent) },
      { path: 'casos', loadComponent: () => import('../../pages/modules/casos/casos.component').then(m => m.CasosComponent) },
      { path: 'resoluciones', loadComponent: () => import('../../pages/modules/resolucion/resolucion.component').then(m => m.ResolucionComponent) },
      { path: 'auditoria', loadComponent: () => import('../../pages/modules/auditorias/auditorias.component').then(m => m.AuditoriasComponent) },
      { path: 'solicitudes', loadComponent: () => import('../../pages/modules/solicitudes/solicitudes.component').then(m => m.SolicitudesComponent) },
      { path: 'calendario', loadComponent: () => import('../../pages/modules/calendario/calendario.component').then(m => m.CalendarioComponent) },
      { path: '', redirectTo: 'expedientes', pathMatch: 'full' },

    ]


  }

]
