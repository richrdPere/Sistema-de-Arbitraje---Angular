import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';


interface MenuOptions {
  icon: string;
  label: string;
  route: string;
  sublabel: string;
}

@Component({
  selector: 'participe-side-menu-options',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './participe-side-menu-options.component.html',
})
export class ParticipeSideMenuOptionsComponent {
  constructor(private router: Router) { }

  menuOptions: MenuOptions[] = [
    {
      icon: 'fa-solid fa-file',
      label: 'Expedientes',
      sublabel: 'Accede al mapa en tiempo real',
      route: '/participe/expedientes',
    },
    {
      icon: 'fa-solid fa-user-tie',
      label: 'Resolución',
      sublabel: 'Resumen de las actividades realizadas',
      route: '/participe/resoluciones',
    },
    {
      icon: 'fa-solid fa-scale-balanced',
      label: 'Auditoria',
      sublabel: 'Reporta los avances del dia',
      route: '/participe/auditoria',
    },
  ];

  logout() {
    this.router.navigate(['/login']);
  }

}
