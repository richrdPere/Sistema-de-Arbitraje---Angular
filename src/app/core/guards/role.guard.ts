import { inject } from '@angular/core';

import {
  CanActivateFn,
  CanActivateChildFn,
  Router,
  UrlTree,
} from '@angular/router';

// Services
import { AuthService } from 'src/app/pages/auth/services/auth.service';
import { AuthStorageService } from '../auth/auth-storage.service';

// =========================================================
// GUARD DE SESIÓN Y ROL
// =========================================================

export const RoleGuard: CanActivateFn = (
  route,
  _state,
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const authStorage = inject(AuthStorageService);
  const router = inject(Router);

  const loginUrl = router.createUrlTree([
    '/auth/login',
  ]);

  const deniedUrl = router.createUrlTree([
    '/acceso-denegado',
  ]);

  // =======================================================
  // 1. VALIDAR TOKEN Y EXPIRACIÓN
  // Margen 0: comprobar el vencimiento real almacenado.
  // =======================================================

  if (
    !authStorage.getAccessToken() ||
    authStorage.isAccessTokenExpired(0)
  ) {
    authService.closeLocalSession();

    return loginUrl;
  }

  // =======================================================
  // 2. OBTENER ROL
  // =======================================================

  const rolUsuario = authStorage.getRol();

  if (!rolUsuario) {
    return deniedUrl;
  }

  // =======================================================
  // 3. RESTRICCIONES DE LA RUTA Y SUS PADRES
  // =======================================================

  const restricciones: unknown[] = route.pathFromRoot
    .map((snapshot) => snapshot.data['roles'])
    .filter((value) => value !== undefined);

  if (restricciones.length === 0) {
    return deniedUrl;
  }

  const permitido = restricciones.every(
    (roles: unknown) => {
      if (!Array.isArray(roles)) {
        return false;
      }

      return roles.some(
        (rol: unknown) =>
          typeof rol === 'string' &&
          rol.trim().toUpperCase() === rolUsuario,
      );
    },
  );

  return permitido ? true : deniedUrl;
};

// =========================================================
// GUARD PARA RUTAS HIJAS
// =========================================================

export const RoleChildGuard: CanActivateChildFn = (
  childRoute,
  state,
) => RoleGuard(childRoute, state);

// import { inject } from '@angular/core';
// import { CanActivateFn, CanActivateChildFn, Router, UrlTree } from '@angular/router';
// import { catchError, map, Observable, of } from 'rxjs';

// // Services
// import { AuthService } from 'src/app/pages/auth/services/auth.service';
// import { AuthStorageService } from '../auth/auth-storage.service';

// // =========================================================
// // GUARD DE SESIÓN Y ROL
// // =========================================================
// export const RoleGuard: CanActivateFn = (
//   route,
//   _state,
// ): boolean | UrlTree | Observable<boolean | UrlTree> => {
//   const authService = inject(AuthService);
//   const authStorage = inject(AuthStorageService);
//   const router = inject(Router);

//   const loginUrl = router.createUrlTree(['/auth/login']);

//   const deniedUrl = router.createUrlTree(['/acceso-denegado']);

//   // =======================================================
//   // VALIDAR ROL
//   // Se comprueban las restricciones de la ruta actual
//   // y de sus padres.
//   // =======================================================
//   const validarAcceso = (): boolean | UrlTree => {
//     if (!authService.isAuthenticated()) {
//       return loginUrl;
//     }

//     const rolUsuario = authService.getCurrentRole();

//     if (!rolUsuario) {
//       return deniedUrl;
//     }

//     const restricciones = route.pathFromRoot
//       .map(snapshot => snapshot.data['roles'])
//       .filter(value => value !== undefined);

//     // Este guard requiere al menos una configuración
//     // de roles en la ruta o en sus padres.
//     if (restricciones.length === 0) {
//       return deniedUrl;
//     }

//     const permitido = restricciones.every(
//       (roles: unknown) => {
//         if (!Array.isArray(roles)) {
//           return false;
//         }

//         return roles.some(
//           (rol: unknown) =>
//             typeof rol === 'string' &&
//             rol.trim().toUpperCase() === rolUsuario,
//         );
//       },
//     );

//     return permitido ? true : deniedUrl;
//   };

//   // =======================================================
//   // 1. ACCESS TOKEN VIGENTE
//   // =======================================================
//   if (authService.isAuthenticated()) {
//     return validarAcceso();
//   }

//   // =======================================================
//   // 2. SIN POSIBILIDAD DE RENOVAR
//   // =======================================================
//   if (!authService.canRefreshSession()) {
//     authService.closeLocalSession();
//     return loginUrl;
//   }

//   // =======================================================
//   // 3. RENOVAR ANTES DE PERMITIR LA NAVEGACIÓN
//   // AuthService comparte la petición si ya hay otra
//   // renovación en curso.
//   // =======================================================
//   return authService.refreshSesion().pipe(
//     map(() => validarAcceso()),

//     catchError(() => {
//       // AuthService se encarga de limpiar la sesión
//       // cuando el backend rechaza el refresh token.
//       // Un fallo de red no borra los datos locales.
//       return of(loginUrl);
//     }),
//   );
// };

// // =========================================================
// // PROTEGER TAMBIÉN LA NAVEGACIÓN ENTRE RUTAS HIJAS
// // =========================================================
// export const RoleChildGuard: CanActivateChildFn = (
//   childRoute,
//   state,
// ) => RoleGuard(childRoute, state);
