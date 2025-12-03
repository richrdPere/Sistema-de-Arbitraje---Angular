import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const RoleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  if (!usuario || !usuario.rol) {
    router.navigate(['/login']);
    return false;
  }

  // Convertir ambos a MAYÚSCULAS para comparar sin errores
  const rolUsuario = usuario.rol.toUpperCase();

  console.log("ROL: ", rolUsuario);


  const allowedRoles = (route.data?.['roles'] as string[]).map(r => r.toUpperCase());

  console.log("ROLES: ", allowedRoles);

  if (allowedRoles.includes(rolUsuario)) {
    return true;
  }

  router.navigate(['/trazabilidad/denegado']);
  return false;
};
