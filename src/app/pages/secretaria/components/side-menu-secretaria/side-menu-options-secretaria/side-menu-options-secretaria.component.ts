import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuOptions } from 'src/app/interfaces/components/MenuOptions';

@Component({
  selector: 'side-menu-options-secretaria',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu-options-secretaria.component.html',
})
export class SideMenuOptionsSecretariaComponent {

  constructor(private router: Router) { }

  menuOptions: MenuOptions[] = [
    {
      icon: 'fa-solid fa-book-journal-whills',
      label: 'Casos',
      route: '/secretaria/casos',
    },
    {
      icon: 'fa-solid fa-file',
      label: 'Expedientes',
      route: '/secretaria/expedientes',
    },
    {
      icon: 'fa-solid fa-user-tie',
      label: 'Participes',
      route: '/secretaria/participes',
    },
    {
      icon: 'fa-solid fa-users',
      label: 'Usuarios',
      route: '/secretaria/usuarios',
    },
    {
      icon: 'fa-solid fa-scale-balanced',
      label: 'Auditoria',
      route: '/secretaria/auditoria',
    },
    {
      icon: 'fa-solid fa-gavel',
      label: 'Solicitudes',
      route: '/secretaria/solicitudes',
    },
    {
      icon: 'fa-solid fa-calendar-days',
      label: 'Calendario',
      route: '/secretaria/calendario',
    },
    // {
    //   icon: 'fa-solid fa-flask-vial',
    //   label: 'Test pages',
    //   sublabel: 'Ruta de paginas de prueba',
    //   route: '/dashboard/test_pages',
    // },
  ];

  logout() {
    this.router.navigate(['/login']);
  }




}
