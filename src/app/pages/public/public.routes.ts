import { Routes } from '@angular/router';
import { PublicLayoutComponent } from 'src/app/layout/public-layout/public-layout.component';


export const mainRoutes: Routes = [

  // --- Layout publico ----
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('../../pages/public/home/home.component').then(m => m.HomeComponent) },
      { path: 'about', loadComponent: () => import('../../pages/public/about/about.component').then(m => m.AboutComponent) },
      {
        path: 'servicios',
        loadComponent: () => import('../../pages/public/servicios/servicios.component').then(m => m.ServiciosComponent),
      },
      {
        path: 'ser_mesa_partes',
        loadComponent: () => import('../../pages/public/servicios/mesa_partes/mesa_partes.component').then(m => m.MesaPartesComponent)
      },
      {
        path: 'ser_consulta_expedientes',
        loadComponent: () => import('../../pages/public/servicios/consulta_expedientes/consulta_expedientes.component').then(m => m.ConsultaExpedientesComponent)
      },
      {
        path: 'ser_calculadora',
        loadComponent: () => import('../../pages/public/servicios/calculadora/calculadora.component').then(m => m.CalculadoraComponent)
      },
      {
        path: 'laudos',
        loadComponent: () => import('../../pages/public/laudos/laudos.component').then(m => m.LaudosComponent),
      },
      {
        path: 'licencia',
        loadComponent: () => import('../../pages/public/licencia/licencia.component').then(m => m.LicenciaComponent),
      },
      {
        path: 'desiciones',
        loadComponent: () => import('../../pages/public/desiciones/desiciones.component').then(m => m.DesicionesComponent),
      },
      {
        path: 'arbitraje',
        loadComponent: () => import('../../pages/public/arbitraje/arbitraje.component').then(m => m.ArbitrajeComponent),
      },
      {
        path: 'arbitraje/nominas_adjudicadores',
        loadComponent: () => import('../../pages/public/arbitraje/nomina_adjudicadores/nomina_adjudicadores.component').then(m => m.NominaAdjudicadoresComponent),
      },
      {
        path: 'arbitraje/nominas_arbitros',
        loadComponent: () => import('../../pages/public/arbitraje/nomina_arbitros/nomina_arbitros.component').then(m => m.NominaArbitrosComponent),
      },
      {
        path: 'hoja_vida',
        loadComponent: () => import('../../pages/public/hoja-vida/hoja-vida.component').then(m => m.HojaVidaComponent),
      },
      {
        path: 'conciliaciones',
        loadComponent: () => import('../../pages/public/conciliaciones/conciliaciones.component').then(m => m.ConciliacionesComponent),
      },
      {
        path: 'procesos_judiciales',
        loadComponent: () => import('../../pages/public/procesos-judiciales/procesos-judiciales.component').then(m => m.ProcesosJudicialesComponent),
      },
      {
        path: 'jprd',
        loadComponent: () => import('../../pages/public/cajprd/cajprd.component').then(m => m.CajprdComponent),
      },
      {
        path: 'jprd/montos_maximos_controversias',
        loadComponent: () => import('../../pages/public/cajprd/montos-maximos-controversias/montos-maximos-controversias.component').then(m => m.MontosMaximosControversiasComponent),
      },
      {
        path: 'trazabilidad',
        //loadComponent: () => import('../../pages/public/trazabilidad/trazabilidad.component').then(m => m.TrazabilidadComponent),
        loadComponent: () => import('../auth/login-page/login-page.component').then(m => m.LoginPageComponent),
      },
      {
        path: 'unidad_gobierno',
        loadComponent: () => import('../../pages/public/unidad_gobierno/unidad_gobierno.component').then(m => m.UnidadGobiernoComponent),
      },
      { path: 'contacto', loadComponent: () => import('../../pages/public/contactos/contactos.component').then(m => m.ContactosComponent) },
      // { path: 'login', loadComponent: () => import('../../pages/public/login/login.component').then(m => m.LoginComponent) },
      {
        path: 'confirmar-cuenta/:token',
        loadComponent: () =>
          import('../../pages/public/confirmar-cuenta/confirmar-cuenta.component').then(
            (m) => m.ConfirmarCuentaComponent
          ),
      },
    ],
  },

];

export default mainRoutes;
