import { Component, computed, DestroyRef, EventEmitter, HostListener, inject, Input, Output, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';
import iziToast from 'izitoast';

// Services
import { AuthService } from 'src/app/pages/auth/services/auth.service';

// Models
import { AuthRol } from 'src/app/core/models/auth-session.model';


// =========================================================
// INTERFACES
// =========================================================
interface SidebarItem {
  icon: string;
  label: string;
  description: string;
  route: string;
  roles: readonly AuthRol[];
}

interface SidebarGroup {
  title: string;
  items: readonly SidebarItem[];
}

@Component({
  selector: 'sidebar-admin',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidebar-admin.component.html',
  host: {
    class: 'drawer-side z-40',
  },
  styles: ``,
})
export class SidebarAdminComponent {
  // =========================================================
  // DEPENDENCIAS
  // =========================================================
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // =========================================================
  // COMUNICACIÓN CON ADMIN LAYOUT
  // =========================================================
  @Input() drawerId = 'admin-drawer';

  @Output()
  readonly closeRequested = new EventEmitter<void>();

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

  // Se utiliza correo, campo confirmado de AuthUsuario.
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
  // NAVEGACIÓN
  // Conserva los permisos de tu menú anterior.
  // =========================================================
  private readonly menuGroups: readonly SidebarGroup[] = [
    {
      title: 'Gestión arbitral',
      items: [
        {
          icon: 'fa-solid fa-folder-open',
          label: 'Expedientes',
          description: 'Gestión de expedientes arbitrales',
          route: '/admin/expedientes',
          roles: ['ADMIN', 'SECRETARIA'],
        },
        // {
        //   icon: 'fa-solid fa-user-tie',
        //   label: 'Árbitros',
        //   description: 'Registro y consulta de árbitros',
        //   route: '/admin/arbitros',
        //   roles: ['ADMIN', 'SECRETARIA'],
        // },
        // {
        //   icon: 'fa-solid fa-user-check',
        //   label: 'Designaciones',
        //   description: 'Gestiona las designaciones arbitrales',
        //   route: '/admin/designaciones',
        //   roles: ['ADMIN', 'SECRETARIA'],
        // },
        // {
        //   icon: 'fa-solid fa-clipboard-user',
        //   label: 'Mis designaciones',
        //   description: 'Consulta tus designaciones',
        //   route: '/admin/designacion-arbitros',
        //   roles: ['ADMIN', 'ARBITRO'],
        // },
        {
          icon: 'fa-solid fa-file-circle-plus',
          label: 'Solicitudes',
          description: 'Revisión de solicitudes recibidas',
          route: '/admin/solicitudes',
          roles: ['ADMIN', 'SECRETARIA'],
        },
        {
          icon: 'fa-solid fa-magnifying-glass',
          label: 'Trazabilidad',
          description: 'Seguimiento documental de expedientes',
          route: '/admin/trazabilidad',
          roles: ['ADMIN', 'SECRETARIA'],
        },
      ],
    },
    // {
    //   title: 'Actuaciones y agenda',
    //   items: [
    //     {
    //       icon: 'fa-solid fa-file-word',
    //       label: 'Resoluciones',
    //       description: 'Consulta y gestión de resoluciones',
    //       route: '/admin/resoluciones',
    //       roles: ['ADMIN', 'ARBITRO'],
    //     },
    //     {
    //       icon: 'fa-solid fa-users',
    //       label: 'Audiencias',
    //       description: 'Programación y seguimiento de audiencias',
    //       route: '/admin/audiencias',
    //       roles: ['ADMIN', 'ARBITRO'],
    //     },
    //     {
    //       icon: 'fa-solid fa-gavel',
    //       label: 'Laudos',
    //       description: 'Consulta y gestión de laudos arbitrales',
    //       route: '/admin/laudos',
    //       roles: ['ADMIN', 'ARBITRO'],
    //     },
    //     {
    //       icon: 'fa-solid fa-calendar-days',
    //       label: 'Calendario',
    //       description: 'Agenda de actividades arbitrales',
    //       route: '/admin/calendario',
    //       roles: ['ADMIN', 'ARBITRO'],
    //     },
    //   ],
    // },
    {
      title: 'Administración',
      items: [
        {
          icon: 'fa-solid fa-users-gear',
          label: 'Usuarios',
          description: 'Administración de usuarios del sistema',
          route: '/admin/usuarios',
          roles: ['ADMIN'],
        },
        // {
        //   icon: 'fa-solid fa-shield-halved',
        //   label: 'Auditoría',
        //   description: 'Consulta de acciones registradas',
        //   route: '/admin/auditoria',
        //   roles: ['ADMIN'],
        // },
      ],
    },
  ];

  readonly navigationGroups = computed(() => {
    const rol = this.currentUser()?.rol;

    if (!rol) {
      return [];
    }

    return this.menuGroups
      .map(group => ({
        title: group.title,
        items: group.items.filter(
          item => item.roles.includes(rol),
        ),
      }))
      .filter(group => group.items.length > 0);
  });

  // =========================================================
  // CERRAR SIDEBAR
  // El layout controla el estado del drawer.
  // =========================================================
  closeSidebar(): void {
    this.closeRequested.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapePressed(): void {
    this.closeSidebar();
  }

  // =========================================================
  // CERRAR SESIÓN
  // =========================================================
  logout(): void {
    if (this.closingSession()) {
      return;
    }

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
          // AuthService limpia únicamente la sesión
          // que corresponde a la respuesta del backend.
          if (this.authService.getCurrentUser()) {
            return;
          }

          this.closeSidebar();

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
          const message =
            this.getErrorMessage(error);

          iziToast.error({
            title: 'Error',
            message,
            position: 'bottomRight',
          });
        },
      });
  }

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
