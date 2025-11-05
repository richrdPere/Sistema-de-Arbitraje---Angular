import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface MenuOptions {
  icon: string;
  label: string;
  route: string;
  sublabel: string;
}

@Component({
  selector: 'adjudicador-side-menu-options',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './adjudicador-side-menu-options.component.html',
})
export class AdjudicadorSideMenuOptions {

  constructor(private router: Router) { }

  menuOptions: MenuOptions[] = [
    {
      icon: 'fa-solid fa-file',
      label: 'Expedientes',
      sublabel: 'Accede al mapa en tiempo real',
      route: '/adjudicador/expedientes',
    },
    {
      icon: 'fa-solid fa-user-tie',
      label: 'Resolución',
      sublabel: 'Resumen de las actividades realizadas',
      route: '/adjudicador/resoluciones',
    },
    {
      icon: 'fa-solid fa-user-tie',
      label: 'Solicitud',
      sublabel: 'Resumen de las actividades realizadas',
      route: '/adjudicador/resoluciones',
    },
    {
      icon: 'fa-solid fa-scale-balanced',
      label: 'Auditoria',
      sublabel: 'Reporta los avances del dia',
      route: '/adjudicador/auditoria',
    },
  ];

  logout() {
    this.router.navigate(['/login']);
  }
}
