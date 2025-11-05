import { Routes } from "@angular/router";
import { SecretariaLayoutComponent } from "./secretaria_layout/secretaria_layout.component";
import { adminGuard } from "src/app/guards/admin.guard";

export const SecretariaRoutes: Routes = [
  {
    path: '',
    component: SecretariaLayoutComponent,
    children: [
      { path: 'expedientes', loadComponent: () => import('./pages/expedientes/expedientes.component').then(m => m.ExpedientesComponent) },
      { path: 'participes', loadComponent: () => import('./pages/participes/participes.component').then(m => m.ParticipesComponent) },
      { path: 'usuarios', loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent) },
      { path: 'auditoria', loadComponent: () => import('./pages/auditoria/auditoria.component').then(m => m.AuditoriaComponent) },
      { path: 'solicitudes', loadComponent: () => import('./pages/solicitudes/solicitudes.component').then(m => m.SolicitudesComponent) },
      { path: '', redirectTo: 'expedientes', pathMatch: 'full' },
    ]
  }
  // ✅ ELIMINADO: No necesita ruta comodín aquí
];

export default SecretariaRoutes;



