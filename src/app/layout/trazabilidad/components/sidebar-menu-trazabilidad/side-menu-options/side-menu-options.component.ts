import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface MenuOptions {
  icon: string;
  label: string;
  route: string;
  sublabel: string;
  roles: string[];  //  NUEVO
}

@Component({
  selector: 'side-menu-options',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu-options.component.html',
})
export class SideMenuOptionsComponent {

  rolUsuario = '';

  constructor(private router: Router) {
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.rolUsuario = (user?.rol || '').toUpperCase();
  }

  menuOptions: MenuOptions[] = [
    {
      icon: 'fa-solid fa-file',
      label: 'Expedientes',
      sublabel: 'Accede al mapa en tiempo real',
      route: '/app/expedientes',
      roles: ['ADMIN', 'SECRETARIA'],
    },
    {
      icon: 'fa-solid fa-user-tie',
      label: 'Participes',
      sublabel: 'Resumen de las actividades realizadas',
      route: '/app/participes',
      roles: ['ADMIN', 'SECRETARIA'],
    },
    {
      icon: 'fa-solid fa-book-journal-whills',
      label: 'Acta Instalación',
      sublabel: 'Casos abiertos de las solicitudes aprobadas',
      route: '/app/acta-instalacion',
      roles: ['ADMIN', 'ARBITRO', 'SECRETARIA'],
    },
    {
      icon: 'fa-solid fa-building-columns',
      label: 'Casos',
      sublabel: 'Casos abiertos de las solicitudes aprobadas',
      route: '/app/casos',
      roles: ['ADMIN', 'ARBITRO'],
    },
    {
      icon: 'fas fa-arrow-right text-muted',
      label: 'Designaciones',
      sublabel: 'Casos abiertos de las solicitudes aprobadas',
      route: '/app/designaciones',
      roles: ['ADMIN', 'ARBITRO', 'SECRETARIA'],
    },
    {
      icon: 'fa-solid fa-users',
      label: 'Usuarios',
      sublabel: 'Gestióna zonas de patrullaje',
      route: '/app/usuarios',
      roles: ['ADMIN'],
    },
    {
      icon: 'fa-solid fa-file-word',
      label: 'Resoluciones',
      sublabel: 'Reporta los avances del dia',
      route: '/app/resoluciones',
      roles: ['ADMIN', 'ARBITRO'],
    },
    {
      icon: 'fas fa-users',
      label: 'Audiencias',
      sublabel: 'Reporta los avances del dia',
      route: '/app/audiencias',
      roles: ['ADMIN', 'ARBITRO'],
    },
    {
      icon: 'fas fa-file-contract',
      label: 'Laudos',
      sublabel: 'Reporta los avances del dia',
      route: '/app/laudos',
      roles: ['ADMIN', 'ARBITRO'],
    },

    {
      icon: 'fa-solid fa-scale-balanced',
      label: 'Auditoria',
      sublabel: 'Reporta los avances del dia',
      route: '/app/auditoria',
      roles: ['ADMIN'],
    },
    {
      icon: 'fa-solid fa-gavel',
      label: 'Solicitudes',
      sublabel: 'Evalua la logistica dentro de los bienes del almacén',
      route: '/app/solicitudes',
      roles: ['ADMIN', 'SECRETARIA'],
    },
    {
      icon: 'fa-solid fa-calendar-days',
      label: 'Calendario',
      sublabel: 'Calendario de actividades',
      route: '/app/calendario',
      roles: ['ADMIN', 'SECRETARIA', 'ARBITRO'],
    },
    {
      icon: 'fa-solid fa-magnifying-glass-chart',
      label: 'Trazabilidad',
      sublabel: 'Accede al mapa en tiempo real',
      route: '/app/trazabilidad',
      roles: ['ADMIN', 'SECRETARIA'],
    },
  ];

  get filteredMenu() {
    return this.menuOptions.filter(item => item.roles.includes(this.rolUsuario));
  }

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/trazabilidad']);
  }
}
