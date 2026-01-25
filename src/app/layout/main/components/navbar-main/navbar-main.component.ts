import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Service
import { ThemeService } from 'src/app/services/theme.service';


interface NavbarChild {
  label: string;
  path: string;
}

interface NavbarLink {
  label: string;       // Texto a mostrar
  path?: string;        // Ruta a navegar
  activeClass?: string; // Clase para cuando la ruta está activa
  children?: NavbarChild[];
  type?: 'link' | 'button'; // Tipo de enlace
  buttonStyle?: string; // Clases para botones
}


@Component({
  selector: 'app-navbar-main',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar-main.component.html',
})
export class NavbarMainComponent {
  theme: string = 'light';

  constructor(private themeService: ThemeService) { }

  // Lista dinámica de rutas
  navbarLinks: NavbarLink[] = [
    // {
    //   label: 'Inicio',
    //   path: '/home',
    //   activeClass: 'bg-info text-base-100'
    // },
    {
      label: 'Institucional',
      activeClass: 'bg-info text-base-100',
      children: [
        { label: 'Nosotros', path: '/about' },
        { label: 'Estructura Institucional', path: '/unidad_gobierno' },
        { label: 'Servicios', path: '/servicios' },
        { label: 'Licencias', path: '/licencia' },
        { label: 'Banco de Laudos', path: '/laudos' },
        { label: 'Banco de Decisiones', path: '/desiciones' },
      ]
    },
    {
      label: 'Conciliaciones',
      path: '/conciliaciones',
      activeClass: 'bg-info text-base-100'
    },

    {
      label: 'Proceso\nJudiciales',
      path: '/procesos_judiciales',
      activeClass: 'bg-info text-base-100'
    },

    {
      label: 'Centro de Arbitraje',
      path: '/arbitraje',
      activeClass: 'bg-info text-base-100'
    },

    {
      label: 'JPRD',
      path: '/jprd',
      activeClass: 'bg-primary text-base-100'
    },
    // {
    //   label: 'Decisiones',
    //   path: '/desiciones',
    //   activeClass: 'bg-info text-base-100'
    // },

    // {
    //   label: 'Centro de Arbitraje',
    //   // path: '/arbitraje',
    //   activeClass: 'text-base-100',
    //   children: [
    //     { label: 'Laudos', path: '/laudos' },
    //     { label: 'Arbitraje', path: '/arbitraje' },

    //   ]
    // },
    // {
    //   label: 'JPRD',
    //   // path: '/jprd',
    //   activeClass: 'text-base-100',
    //   children: [
    //     { label: 'JPRD', path: '/jprd' },
    //     { label: 'Decisiones', path: '/desiciones' },
    //   ]
    // },
    {
      label: 'Mesa de Partes',
      path: '/ser_mesa_partes',
      activeClass: 'bg-primary text-base-100'
    },
    {
      label: 'Contáctanos',
      path: '/contacto',
      activeClass: 'bg-info text-base-100'
    },
    {
      label: 'Trazabilidad Documentaria',
      path: '/trazabilidad',
      activeClass: 'bg-primary text-base-100'
    },

  ];

  ngOnInit(): void {
    this.theme = this.themeService.getTheme();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.theme = this.themeService.getTheme();
  }
}
