import { Routes } from '@angular/router';
import { LayoutTrazabilidadComponent } from './layout_trazabilidad/layout_trazabilidad.component';
import { RoleGuard } from 'src/app/guards/role.guard';

export const trazabilidadRoutes: Routes = [
  // --- Layout trazabilidad ----
  {
    path: '',
    component: LayoutTrazabilidadComponent,
    canActivate: [RoleGuard],
    // Permitir acceso al layout a TODOS los roles válidos
    data: { roles: ['ADMIN', 'SECRETARIA', 'ARBITRO', 'PARTICIPE', 'ADJUDICADOR'] },
    children: [

      // ----------------------------
      //  Expedientes
      // ----------------------------
      {
        path: 'expedientes',
        loadComponent: () => import('../../pages/modules/expedientes/expedientes.component').then(m => m.ExpedientesComponent),
        data: { roles: ['ADMIN', 'SECRETARIA'] }
      },
      {
        path: 'expedientes/:id/documentos',
        loadComponent: () =>
          import('../../pages/modules/expedientes/ver-documentos/ver-documentos.component')
            .then(m => m.VerDocumentosComponent),
        data: { roles: ['ADMIN', 'SECRETARIA', 'ARBITRO'] }
      },
      {
        path: 'expedientes/:id/participes',
        loadComponent: () =>
          import('../../pages/modules/expedientes/gestionar-participes/gestionar-participes.component')
            .then(m => m.GestionarParticipesComponent),
        data: { roles: ['ADMIN', 'SECRETARIA'] }
      },
      {
        path: 'expedientes/:id/historial',
        loadComponent: () =>
          import('../../pages/modules/expedientes/ver-historial/ver-historial.component')
            .then(m => m.VerHistorialComponent),
        data: { roles: ['ADMIN', 'SECRETARIA', 'ARBITRO'] }
      },


      // ----------------------------
      //  Trazabilidad
      // ----------------------------
      {
        path: 'trazabilidad',
        loadComponent: () =>
          import('../../pages/modules/trazabilidad/trazabilidad.component')
            .then(m => m.TrazabilidadComponent),
        data: { roles: ['ADMIN', 'SECRETARIA'] }
      },
      {
        path: 'trazabilidad/:id/documentos',
        loadComponent: () =>
          import('../../pages/modules/trazabilidad/documentos/documentos.component')
            .then(m => m.DocumentosComponent),
        data: { roles: ['ADMIN', 'SECRETARIA', 'ARBITRO'] }
      },


      // ----------------------------
      //  Otros módulos
      // ----------------------------
      {
        path: 'participes',
        loadComponent: () =>
          import('../../pages/modules/participes/participes.component')
            .then(m => m.ParticipesComponent),
        data: { roles: ['ADMIN', 'SECRETARIA'] }
      },
      {
        path: 'designaciones',
        loadComponent: () =>
          import('../../pages/modules/designaciones/designaciones.component')
            .then(m => m.DesignacionesComponent),
        data: { roles: ['ADMIN', 'ARBITRO', 'SECRETARIA'] }
      },
      {
        path: 'acta-instalacion',
        loadComponent: () =>
          import('../../pages/modules/acta-instalacion/acta-instalacion.component')
            .then(m => m.ActaInstalacionComponent),
        data: { roles: ['ADMIN', 'ARBITRO', ] }// 'SECRETARIA'
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('../../pages/modules/perfil/perfil.component')
            .then(m => m.PerfilComponent),
        data: { roles: ['ADMIN', 'SECRETARIA', 'ARBITRO', 'PARTICIPE'] }
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('../../pages/modules/usuarios/usuarios.component')
            .then(m => m.UsuariosComponent),
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'casos',
        loadComponent: () =>
          import('../../pages/modules/casos/casos.component')
            .then(m => m.CasosComponent),
        data: { roles: ['ADMIN', 'ARBITRO'] }
      },
      {
        path: 'resoluciones',
        loadComponent: () =>
          import('../../pages/modules/resolucion/resolucion.component')
            .then(m => m.ResolucionComponent),
        data: { roles: ['ADMIN', 'ARBITRO'] }
      },
      {
        path: 'auditoria',
        loadComponent: () =>
          import('../../pages/modules/auditorias/auditorias.component')
            .then(m => m.AuditoriasComponent),
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'audiencias',
        loadComponent: () =>
          import('../../pages/modules/audiencias/audiencias.component')
            .then(m => m.AudienciasComponent),
        data: { roles: ['ADMIN', 'ARBITRO'] }
      },
      {
        path: 'laudos',
        loadComponent: () =>
          import('../../pages/modules/laudos/laudos.component')
            .then(m => m.LaudosComponent),
        data: { roles: ['ADMIN', 'ARBITRO'] }
      },
      {
        path: 'solicitudes',
        loadComponent: () =>
          import('../../pages/modules/solicitudes/solicitudes.component')
            .then(m => m.SolicitudesComponent),
        data: { roles: ['ADMIN', 'SECRETARIA'] }
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('../../pages/modules/calendario/calendario.component')
            .then(m => m.CalendarioComponent),
        data: { roles: ['ADMIN',  'ARBITRO'] } // 'SECRETARIA',
      },

      // Redirect default
      { path: '', redirectTo: 'expedientes', pathMatch: 'full' }
    ]
  }
];


export default trazabilidadRoutes;
