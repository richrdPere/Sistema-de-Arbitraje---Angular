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




  const allowedRoles = (route.data?.['roles'] as string[]).map(r => r.toUpperCase());



  if (allowedRoles.includes(rolUsuario)) {
    return true;
  }

  router.navigate(['/trazabilidad/denegado']);
  return false;
};
