import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Service
import { ThemeService } from 'src/app/services/theme.service';

interface NavbarChild {
  label: string;
  path: string;
}

interface NavbarLink {
  label: string;
  path?: string;
  activeClass?: string;
  children?: NavbarChild[];
  type?: 'link' | 'button';
  buttonStyle?: string;
}

@Component({
  selector: 'app-navbar-main',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar-main.component.html',
})
export class NavbarMainComponent implements OnInit {
  theme = 'light';
  mobileMenuOpen = false;

  readonly navbarLinks: NavbarLink[] = [
    {
      label: 'Institucional',
      activeClass: 'bg-info text-info-content',
      children: [
        {
          label: 'Nosotros',
          path: '/about',
        },
        {
          label: 'Estructura Institucional',
          path: '/unidad_gobierno',
        },
        {
          label: 'Servicios',
          path: '/servicios',
        },
        {
          label: 'Licencias',
          path: '/licencia',
        },
        {
          label: 'Banco de Laudos',
          path: '/laudos',
        },
        {
          label: 'Banco de Decisiones',
          path: '/desiciones',
        },
      ],
    },
    {
      label: 'Conciliaciones',
      path: '/conciliaciones',
      activeClass: 'bg-info text-info-content',
    },
    {
      label: 'Procesos Judiciales',
      path: '/procesos_judiciales',
      activeClass: 'bg-info text-info-content',
    },
    {
      label: 'Centro de Arbitraje',
      path: '/arbitraje',
      activeClass: 'bg-info text-info-content',
    },
    {
      label: 'JPRD',
      path: '/jprd',
      activeClass: 'bg-primary text-primary-content',
    },
    {
      label: 'Mesa de Partes',
      path: '/ser_mesa_partes',
      activeClass: 'bg-primary text-primary-content',
    },
    {
      label: 'Contáctanos',
      path: '/contacto',
      activeClass: 'bg-info text-info-content',
    },
    {
      label: 'Trazabilidad Documentaria',
      path: '/trazabilidad',
      activeClass: 'bg-primary text-primary-content',
    },
  ];

  constructor(private readonly themeService: ThemeService) { }

  ngOnInit(): void {
    this.theme = this.themeService.getTheme();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.theme = this.themeService.getTheme();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  /**
   * Cierra el menú móvil cuando se presiona Escape.
   */
  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    this.closeMobileMenu();
  }

  /**
   * Si el usuario amplía la pantalla, evita mantener abierto
   * el menú móvil detrás de la navegación de escritorio.
   */
  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth >= 1280 && this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }
}
