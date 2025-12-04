import { Routes } from '@angular/router';
import { LayoutComponentMain } from './layout_main/layout_main.component';

export const mainRoutes: Routes = [

  // --- Layout publico ----
  {
    path: '',
    component: LayoutComponentMain,
    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('../../pages/auth/home/home.component').then(m => m.HomeComponent) },
      { path: 'about', loadComponent: () => import('../../pages/auth/about/about.component').then(m => m.AboutComponent) },
      {
        path: 'servicios',
        loadComponent: () => import('../../pages/auth/servicios/servicios.component').then(m => m.ServiciosComponent),
      },
      {
        path: 'ser_mesa_partes',
        loadComponent: () => import('../../pages/auth/servicios/mesa_partes/mesa_partes.component').then(m => m.MesaPartesComponent)
      },
      {
        path: 'ser_consulta_expedientes',
        loadComponent: () => import('../../pages/auth/servicios/consulta_expedientes/consulta_expedientes.component').then(m => m.ConsultaExpedientesComponent)
      },
      {
        path: 'ser_calculadora',
        loadComponent: () => import('../../pages/auth/servicios/calculadora/calculadora.component').then(m => m.CalculadoraComponent)
      },
      {
        path: 'laudos',
        loadComponent: () => import('../../pages/auth/laudos/laudos.component').then(m => m.LaudosComponent),
      },
      {
        path: 'licencia',
        loadComponent: () => import('../../pages/auth/licencia/licencia.component').then(m => m.LicenciaComponent),
      },
      {
        path: 'desiciones',
        loadComponent: () => import('../../pages/auth/desiciones/desiciones.component').then(m => m.DesicionesComponent),
      },
      {
        path: 'arbitraje',
        loadComponent: () => import('../../pages/auth/arbitraje/arbitraje.component').then(m => m.ArbitrajeComponent),
      },
      {
        path: 'arbitraje/nominas_adjudicadores',
        loadComponent: () => import('../../pages/auth/arbitraje/nomina_adjudicadores/nomina_adjudicadores.component').then(m => m.NominaAdjudicadoresComponent),
      },
      {
        path: 'arbitraje/nominas_arbitros',
        loadComponent: () => import('../../pages/auth/arbitraje/nomina_arbitros/nomina_arbitros.component').then(m => m.NominaArbitrosComponent),
      },
      {
        path: 'hoja_vida',
        loadComponent: () => import('../../pages/auth/hoja-vida/hoja-vida.component').then(m => m.HojaVidaComponent),
      },
      {
        path: 'jprd',
        loadComponent: () => import('../../pages/auth/cajprd/cajprd.component').then(m => m.CajprdComponent),
      },
      {
        path: 'jprd/montos_maximos_controversias',
        loadComponent: () => import('../../pages/auth/cajprd/montos-maximos-controversias/montos-maximos-controversias.component').then(m => m.MontosMaximosControversiasComponent),
      },
      {
        path: 'trazabilidad',
        loadComponent: () => import('../../pages/auth/trazabilidad/trazabilidad.component').then(m => m.TrazabilidadComponent),
      },
      {
        path: 'unidad_gobierno',
        loadComponent: () => import('../../pages/auth/unidad_gobierno/unidad_gobierno.component').then(m => m.UnidadGobiernoComponent),
      },
      { path: 'contacto', loadComponent: () => import('../../pages/auth/contactos/contactos.component').then(m => m.ContactosComponent) },
      { path: 'login', loadComponent: () => import('../../pages/auth/login/login.component').then(m => m.LoginComponent) },
      {
        path: 'confirmar-cuenta/:token',
        loadComponent: () =>
          import('../../pages/auth/confirmar-cuenta/confirmar-cuenta.component').then(
            (m) => m.ConfirmarCuentaComponent
          ),
      },
    ],
  },

];

export default mainRoutes;
