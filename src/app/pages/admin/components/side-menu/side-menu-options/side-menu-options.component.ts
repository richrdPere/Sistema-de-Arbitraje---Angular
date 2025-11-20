import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface MenuOptions {
  icon: string;
  label: string;
  route: string;
  sublabel: string;
}

@Component({
  selector: 'side-menu-options',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu-options.component.html',
})
export class SideMenuOptionsComponent {
  constructor(private router: Router) { }

  menuOptions: MenuOptions[] = [
    {
      icon: 'fa-solid fa-file',
      label: 'Expedientes',
      sublabel: 'Accede al mapa en tiempo real',
      route: '/admin/expedientes',
    },
     {
      icon: 'fa-solid fa-building-columns',
      label: 'Casos',
      sublabel: 'Casos abiertos de las solicitudes aprobadas',
      route: '/admin/casos',
    },
    {
      icon: 'fa-solid fa-user-tie',
      label: 'Participes',
      sublabel: 'Resumen de las actividades realizadas',
      route: '/admin/participes',
    },
    {
      icon: 'fa-solid fa-users',
      label: 'Usuarios',
      sublabel: 'Gestióna zonas de patrullaje',
      route: '/admin/usuarios',
    },
    {
      icon: 'fa-solid fa-file-word',
      label: 'Resoluciones',
      sublabel: 'Reporta los avances del dia',
      route: '/admin/resoluciones',
    },
    {
      icon: 'fa-solid fa-scale-balanced',
      label: 'Auditoria',
      sublabel: 'Reporta los avances del dia',
      route: '/admin/auditoria',
    },
    {
      icon: 'fa-solid fa-gavel',
      label: 'Solicitudes',
      sublabel: 'Evalua la logistica dentro de los bienes del almacén',
      route: '/admin/solicitudes',
    },
        {
      icon: 'fa-solid fa-calendar-days',
      label: 'Calendario',
      sublabel: 'Calendario de actividades',
      route: '/admin/calendario',
    },

    // {
    //   icon: 'fa-solid fa-comment',
    //   label: 'Chats',
    //   sublabel: 'Conversa y asigna acciones a los serenos u otros operadores',
    //   route: '/dashboard/chats',
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
