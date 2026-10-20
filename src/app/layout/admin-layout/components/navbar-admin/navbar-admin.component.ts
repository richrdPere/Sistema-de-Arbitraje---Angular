import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, Input, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import iziToast from 'izitoast';

// Services
import { AuthService } from 'src/app/pages/auth/services/auth.service';

// =========================================================
// TIPOS
// =========================================================
type AdminTheme = 'light' | 'dark';

@Component({
  selector: 'navbar-admin',
  standalone: true,
  imports: [
    RouterLink,
  ],
  templateUrl: './navbar-admin.component.html',
  host: {
    class: 'sticky top-0 z-30 block',
  },
  styles: ``,
})
export class NavbarAdminComponent implements OnInit {
  // =========================================================
  // DEPENDENCIAS
  // =========================================================
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly isBrowser =
    isPlatformBrowser(this.platformId);

  // Misma clave utilizada por NavbarPublicComponent.
  private readonly THEME_STORAGE_KEY =
    'arbitraje_public_theme';

  // =========================================================
  // CONFIGURACIÓN DESDE ADMIN LAYOUT
  // Estos destinos deben existir en las rutas hijas.
  // =========================================================
  @Input() drawerId = 'admin-drawer';

  @Input() profileRoute = '/admin/perfil';

  @Input() settingsRoute = '/admin/configuracion';

  // =========================================================
  // SESIÓN
  // =========================================================
  readonly currentUser = toSignal(
    this.authService.currentUser$,
    {
      initialValue: this.authService.getCurrentUser(),
    },
  );

  readonly closingSession = signal(false);

  // Se utiliza el correo porque es un campo confirmado
  // de tu modelo AuthUsuario.
  readonly userName = computed(() =>
    this.currentUser()?.correo || 'Usuario',
  );

  readonly userRole = computed(() => {
    const rol = this.currentUser()?.rol;

    return rol
      ? rol.replace(/_/g, ' ')
      : 'Sin sesión';
  });

  readonly userInitials = computed(() => {
    const correo = this.currentUser()?.correo;

    return correo
      ? correo.slice(0, 2).toUpperCase()
      : 'US';
  });

  // =========================================================
  // TEMA
  // =========================================================
  private readonly theme = signal<AdminTheme>('light');

  readonly isDarkMode = computed(
    () => this.theme() === 'dark',
  );

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.applyTheme(
      this.getInitialTheme(),
    );
  }

  toggleTheme(): void {
    if (!this.isBrowser) {
      return;
    }

    // Consultar el documento permite reconocer cambios
    // aplicados por otros componentes.
    const currentTheme =
      this.document.documentElement.getAttribute(
        'data-theme',
      );

    const nextTheme: AdminTheme =
      currentTheme === 'dark' ? 'light' : 'dark';

    this.applyTheme(nextTheme);

    try {
      this.document.defaultView?.localStorage.setItem(
        this.THEME_STORAGE_KEY,
        nextTheme,
      );
    } catch {
      // Mantener el cambio visual aunque no pueda guardarse.
    }
  }

  private getInitialTheme(): AdminTheme {
    const browserWindow = this.document.defaultView;

    try {
      const savedTheme =
        browserWindow?.localStorage.getItem(
          this.THEME_STORAGE_KEY,
        );

      if (this.isValidTheme(savedTheme)) {
        return savedTheme;
      }
    } catch {
      // Continuar con la configuración del documento.
    }

    const documentTheme =
      this.document.documentElement.getAttribute(
        'data-theme',
      );

    if (this.isValidTheme(documentTheme)) {
      return documentTheme;
    }

    const prefersDark =
      browserWindow?.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches ?? false;

    return prefersDark ? 'dark' : 'light';
  }

  private applyTheme(theme: AdminTheme): void {
    const root = this.document.documentElement;

    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    this.theme.set(theme);
  }

  private isValidTheme(
    value: unknown,
  ): value is AdminTheme {
    return value === 'light' || value === 'dark';
  }

  // =========================================================
  // NAVEGACIÓN DE CUENTA
  // =========================================================
  navigateToProfile(): void {
    this.closeDropdown();

    void this.router.navigateByUrl(
      this.profileRoute,
    );
  }

  navigateToSettings(): void {
    this.closeDropdown();

    void this.router.navigateByUrl(
      this.settingsRoute,
    );
  }

  private closeDropdown(): void {
    if (!this.isBrowser) {
      return;
    }

    const activeElement =
      this.document.activeElement;

    if (
      activeElement &&
      'blur' in activeElement &&
      typeof activeElement.blur === 'function'
    ) {
      activeElement.blur();
    }
  }

  // =========================================================
  // CERRAR SESIÓN
  // =========================================================
  logout(): void {
    if (this.closingSession()) {
      return;
    }

    this.closeDropdown();
    this.closingSession.set(true);

    this.authService.logout()
      .pipe(
        takeUntilDestroyed(this.destroyRef),

        finalize(() => {
          this.closingSession.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          // Si hubo otro login durante la petición,
          // AuthService conserva esa nueva sesión.
          if (this.authService.getCurrentUser()) {
            return;
          }

          iziToast.success({
            title: 'Sesión cerrada',
            message:
              response.message ||
              'Has cerrado sesión correctamente.',
            position: 'bottomRight',
          });

          void this.router.navigateByUrl(
            '/auth/login',
            { replaceUrl: true },
          );
        },

        error: (error: unknown) => {
          iziToast.error({
            title: 'Error',
            message: this.getErrorMessage(error),
            position: 'bottomRight',
          });
        },
      });
  }

  // =========================================================
  // MENSAJES DE ERROR
  // =========================================================
  private getErrorMessage(error: unknown): string {
    const fallback = 'No se pudo cerrar la sesión.';

    if (
      typeof error !== 'object' ||
      error === null
    ) {
      return fallback;
    }

    const normalized =
      error as Record<string, unknown>;

    const body = normalized['error'];

    if (
      typeof body === 'object' &&
      body !== null
    ) {
      const message =
        (body as Record<string, unknown>)['message'];

      if (
        typeof message === 'string' &&
        message.trim()
      ) {
        return message;
      }
    }

    const message = normalized['message'];

    return (
      typeof message === 'string' &&
      message.trim()
    )
      ? message
      : fallback;
  }
}
