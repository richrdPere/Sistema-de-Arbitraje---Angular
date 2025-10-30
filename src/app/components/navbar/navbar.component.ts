import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

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
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {

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
        { label: 'Servicios', path: '/servicios' },
        { label: 'Licencias', path: '/licencia' },
        { label: 'Banco de Laudos', path: '/laudos' },
        { label: 'Banco de Decisiones', path: '/desiciones' },
      ]
    },
    {
      label: 'Centro de Arbitraje',
      path: '/arbitraje',
      activeClass: 'bg-info text-base-100'
    },
    // {
    //   label: 'Laudos',
    //   path: '/laudos',
    //   activeClass: 'bg-info text-base-100'
    // },
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




// {
//   label: 'Nosotros',
//   path: '/about',
//   activeClass: 'bg-info text-base-100'
// },
// {
//   label: 'Servicios',
//   path: '/servicios',
//   activeClass: 'bg-info text-base-100'
// },
// {
//   label: 'Laudos',
//   path: '/laudos',
//   activeClass: 'bg-info text-base-100'
// },
// {
//   label: 'Decisiones',
//   path: '/desiciones',
//   activeClass: 'bg-info text-base-100'
// },
// {
//   label: 'Iniciar Sesión',
//   path: '/login',
//   activeClass: 'bg-primary text-base-100'
// },
// {
//   label: 'Registrate',
//   path: '/register',
//   activeClass: 'bg-primary text-base-100'
// },

// {
//   label: 'Iniciar Sesión',
//   path: '/login',
//   type: 'button',
//   // buttonStyle:'text-purple-700 hover:text-white  border border-primary focus:ring-1 focus:outline-none font-medium rounded-lg text-sm px-3 py-2 mb-2 text-center dark:border-primary dark:text-primary dark:hover:text-white dark:hover:bg-primary'
// },
// {
//   label: 'Regístrate',
//   path: '/register',
//   type: 'button',
//   // buttonStyle: 'focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-3 py-2 mb-2 dark:bg-primary dark:hover:bg-primary dark:focus:ring-purple-900'
// }
