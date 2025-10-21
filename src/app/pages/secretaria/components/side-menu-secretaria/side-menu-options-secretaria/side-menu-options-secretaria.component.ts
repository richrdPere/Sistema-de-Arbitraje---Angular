import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuOptions } from 'src/app/interfaces/components/MenuOptions';

@Component({
  selector: 'app-side-menu-options-secretaria',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu-options-secretaria.component.html',
})
export class SideMenuOptionsSecretariaComponent {

  constructor(private router: Router) { }

  menuOptions: MenuOptions[] = [
    {
      icon: 'fa-solid fa-book-journal-whills',
      label: 'Casos',
      route: '/admin/expedientes',
    },
    {
      icon: 'fa-solid fa-file',
      label: 'Expedientes',
      route: '/admin/expedientes',
    },
    {
      icon: 'fa-solid fa-user-tie',
      label: 'Participes',
      route: '/admin/participes',
    },
    {
      icon: 'fa-solid fa-users',
      label: 'Usuarios',
      route: '/admin/usuarios',
    },
    {
      icon: 'fa-solid fa-scale-balanced',
      label: 'Auditoria',
      route: '/admin/auditoria',
    },
    {
      icon: 'fa-solid fa-gavel',
      label: 'Solicitudes',
      route: '/admin/solicitudes',
    },
    // {
    //   icon: 'fa-solid fa-comment',
    //   label: 'Chats',
    //   sublabel: 'Conversa y asigna acciones a los serenos u otros operadores',
    //   route: '/dashboard/chats',
    // },
    // {
    //   icon: 'fa-solid fa-calendar-days',
    //   label: 'Calendario',
    //   sublabel: 'Calendario de actividades',
    //   route: '/dashboard/calendario',
    // },
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
