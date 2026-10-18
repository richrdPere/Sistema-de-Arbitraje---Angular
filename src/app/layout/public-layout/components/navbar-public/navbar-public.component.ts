import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

// =========================================================
// TIPOS E INTERFACES
// =========================================================
type PublicTheme = 'light' | 'dark';

interface NavbarChild {
  label: string;
  path: string;
}

interface NavbarLink {
  label: string;
  path?: string;
  activeClass?: string;
  children?: NavbarChild[];
}

@Component({
  selector: 'navbar-public',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './navbar-public.component.html',
  styles: ``,
})
export class NavbarPublicComponent implements OnInit {
  // =========================================================
  // DEPENDENCIAS
  // =========================================================
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly isBrowser =
    isPlatformBrowser(this.platformId);

  // =========================================================
  // CONFIGURACIÓN
  // =========================================================
  private readonly THEME_STORAGE_KEY =
    'arbitraje_public_theme';

  // Debe coincidir con el breakpoint 2xl del HTML.
  private readonly DESKTOP_BREAKPOINT = 1536;

  // =========================================================
  // ESTADO
  // =========================================================
  theme: PublicTheme = 'light';

  mobileMenuOpen = false;

  // =========================================================
  // NAVEGACIÓN
  // =========================================================
  readonly navbarLinks: readonly NavbarLink[] = [
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
      path: '/auth/login',
      activeClass: 'bg-primary text-primary-content',
    },
  ];

  // =========================================================
  // CICLO DE VIDA
  // =========================================================
  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.applyTheme(
      this.getInitialTheme(),
    );
  }

  // =========================================================
  // TEMA
  // =========================================================
  toggleTheme(): void {
    if (!this.isBrowser) {
      return;
    }

    const nextTheme: PublicTheme =
      this.theme === 'light' ? 'dark' : 'light';

    this.applyTheme(nextTheme);

    try {
      this.document.defaultView?.localStorage.setItem(
        this.THEME_STORAGE_KEY,
        nextTheme,
      );
    } catch {
      // El tema sigue funcionando aunque el navegador
      // no permita guardar la preferencia.
    }
  }

  private getInitialTheme(): PublicTheme {
    const browserWindow = this.document.defaultView;

    // 1. Preferencia guardada por el usuario.
    try {
      const savedTheme =
        browserWindow?.localStorage.getItem(
          this.THEME_STORAGE_KEY,
        );

      if (this.isValidTheme(savedTheme)) {
        return savedTheme;
      }
    } catch {
      // Continuar con el tema del documento o del sistema.
    }

    // 2. Tema ya establecido en el documento.
    const documentTheme =
      this.document.documentElement.getAttribute(
        'data-theme',
      );

    if (this.isValidTheme(documentTheme)) {
      return documentTheme;
    }

    // 3. Preferencia del sistema operativo.
    const prefersDark =
      browserWindow?.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches ?? false;

    return prefersDark ? 'dark' : 'light';
  }

  private applyTheme(theme: PublicTheme): void {
    this.theme = theme;

    const root = this.document.documentElement;

    root.setAttribute('data-theme', theme);

    // Adapta controles nativos y barras de desplazamiento.
    root.style.colorScheme = theme;
  }

  private isValidTheme(
    value: unknown,
  ): value is PublicTheme {
    return value === 'light' || value === 'dark';
  }

  // =========================================================
  // MENÚ MÓVIL
  // =========================================================
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  // =========================================================
  // EVENTOS
  // =========================================================
  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    this.closeMobileMenu();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    const width =
      this.document.defaultView?.innerWidth ?? 0;

    if (width >= this.DESKTOP_BREAKPOINT) {
      this.closeMobileMenu();
    }
  }
}
