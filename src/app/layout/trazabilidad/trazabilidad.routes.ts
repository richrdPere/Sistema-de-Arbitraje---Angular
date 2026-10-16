import { Routes } from '@angular/router';
import { LayoutTrazabilidadComponent } from './layout_trazabilidad/layout_trazabilidad.component';
import { RoleGuard } from 'src/app/core/guards/role.guard';

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
        loadComponent: () => import('../../pages/features/expedientes/expedientes.component').then(m => m.ExpedientesComponent),
        data: { roles: ['ADMIN', 'SECRETARIA'] }
      },
      {
        path: 'expedientes/:id/documentos',
        loadComponent: () =>
          import('../../pages/features/expedientes/components/ver-documentos/ver-documentos.component')
            .then(m => m.VerDocumentosComponent),
        data: { roles: ['ADMIN', 'SECRETARIA', 'ARBITRO'] }
      },
      // {
      //   path: 'expedientes/:id/participes',
      //   loadComponent: () =>
      //     import('../../pages/modules/expedientes/gestionar-participes/gestionar-participes.component')
      //       .then(m => m.GestionarParticipesComponent),
      //   data: { roles: ['ADMIN', 'SECRETARIA'] }
      // },
      {
        path: 'expedientes/:id/historial',
        loadComponent: () =>
          import('../../pages/features/expedientes/components/ver-historial/ver-historial.component')
            .then(m => m.VerHistorialComponent),
        data: { roles: ['ADMIN', 'SECRETARIA', 'ARBITRO'] }
      },


      // ----------------------------
      //  Trazabilidad
      // ----------------------------
      {
        path: 'trazabilidad',
        loadComponent: () =>
          import('../../pages/features/trazabilidad/trazabilidad.component')
            .then(m => m.TrazabilidadComponent),
        data: { roles: ['ADMIN', 'SECRETARIA'] }
      },
      {
        path: 'trazabilidad/:id/documentos',
        loadComponent: () =>
          import('../../pages/features/trazabilidad/components/documentos/documentos.component')
            .then(m => m.DocumentosComponent),
        data: { roles: ['ADMIN', 'SECRETARIA', 'ARBITRO'] }
      },


      // ----------------------------
      //  Otros módulos
      // ----------------------------
      {
        path: 'participes',
        loadComponent: () =>
          import('../../pages/features/participes/participes.component')
            .then(m => m.ParticipesComponent),
        data: { roles: ['ADMIN', 'SECRETARIA'] }
      },
      {
        path: 'arbitros',
        loadComponent: () =>
          import('../../pages/features/arbitros/arbitros.component')
            .then(m => m.ArbitrosComponent),
        data: { roles: ['ADMIN', 'SECRETARIA'] }
      },
      {
        path: 'designaciones',
        loadComponent: () =>
          import('../../pages/features/designaciones/designaciones.component')
            .then(m => m.DesignacionesComponent),
        data: { roles: ['ADMIN', 'SECRETARIA'] }
      },
      {
        path: 'designacion-arbitros',
        loadComponent: () =>
          import('../../pages/features/expedientes/components/designaciones-arbitro/designaciones-arbitro.component')
            .then(m => m.DesignacionesArbitroComponent),
        data: { roles: ['ADMIN', 'ARBITRO'] }
      },
      {
        path: 'acta-instalacion',
        loadComponent: () =>
          import('../../pages/features/acta-instalacion/acta-instalacion.component')
            .then(m => m.ActaInstalacionComponent),
        data: { roles: ['ADMIN', 'ARBITRO',] }// 'SECRETARIA'
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('../../pages/features/perfil/perfil.component')
            .then(m => m.PerfilComponent),
        data: { roles: ['ADMIN', 'SECRETARIA', 'ARBITRO', 'PARTICIPE'] }
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('../../pages/features/usuarios/usuarios.component')
            .then(m => m.UsuariosComponent),
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'casos',
        loadComponent: () =>
          import('../../pages/features/casos/casos.component')
            .then(m => m.CasosComponent),
        data: { roles: ['ADMIN', 'ARBITRO'] }
      },
      {
        path: 'resoluciones',
        loadComponent: () =>
          import('../../pages/features/solicitudes/components/resolucion/resolucion.component')
            .then(m => m.ResolucionComponent),
        data: { roles: ['ADMIN', 'ARBITRO'] }
      },
      {
        path: 'auditoria',
        loadComponent: () =>
          import('../../pages/features/auditorias/auditorias.component')
            .then(m => m.AuditoriasComponent),
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'audiencias',
        loadComponent: () =>
          import('../../pages/features/audiencias/audiencias.component')
            .then(m => m.AudienciasComponent),
        data: { roles: ['ADMIN', 'ARBITRO'] }
      },
      {
        path: 'laudos',
        loadComponent: () =>
          import('../../pages/features/laudos/laudos.component')
            .then(m => m.LaudosComponent),
        data: { roles: ['ADMIN', 'ARBITRO'] }
      },
      {
        path: 'solicitudes',
        loadComponent: () =>
          import('../../pages/features/solicitudes/solicitudes.component')
            .then(m => m.SolicitudesComponent),
        data: { roles: ['ADMIN', 'SECRETARIA'] }
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('../../pages/features/calendario/calendario.component')
            .then(m => m.CalendarioComponent),
        data: { roles: ['ADMIN', 'ARBITRO'] } // 'SECRETARIA',
      },

      // Redirect default
      { path: '', redirectTo: 'expedientes', pathMatch: 'full' }
    ]
  }
];


export default trazabilidadRoutes;
