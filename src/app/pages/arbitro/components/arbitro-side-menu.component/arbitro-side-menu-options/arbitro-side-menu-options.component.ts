import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface MenuOptions {
  icon: string;
  label: string;
  route: string;
  sublabel: string;
}


@Component({
  selector: 'arbitro-side-menu-options',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './arbitro-side-menu-options.component.html',
})
export class ArbitroSideMenuOptions {

  constructor(private router: Router) { }

  menuOptions: MenuOptions[] = [
    {
      icon: 'fa-solid fa-file',
      label: 'Expedientes',
      sublabel: 'Accede al mapa en tiempo real',
      route: '/arbitro/expedientes',
    },
    {
      icon: 'fa-solid fa-user-tie',
      label: 'Resolución',
      sublabel: 'Resumen de las actividades realizadas',
      route: '/arbitro/resoluciones',
    },
    {
      icon: 'fa-solid fa-user-tie',
      label: 'Solicitud',
      sublabel: 'Resumen de las actividades realizadas',
      route: '/arbitro/resoluciones',
    },
    {
      icon: 'fa-solid fa-scale-balanced',
      label: 'Auditoria',
      sublabel: 'Reporta los avances del dia',
      route: '/arbitro/auditoria',
    },
  ];

  logout() {
    this.router.navigate(['/login']);
  }


}
