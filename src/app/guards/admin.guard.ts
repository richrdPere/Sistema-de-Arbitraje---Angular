import { CanActivateChildFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

// Service
import { AdminService } from '../services/admin.service';


export const adminGuard: CanActivateChildFn = (childRoute, state) => {
  const adminService = inject(AdminService);
  const router = inject(Router);

   // Reglas
  const reglas = [
    {
      condicion: adminService.isAuthenticated(['admin']),
      mensaje: 'Debes iniciar sesión.',
      redireccion: '/login'
    },
    // Aquí podrías agregar más reglas, por ejemplo validación de rol, permisos, etc.
    // {
    //   condicion: adminService.isAdmin(),
    //   mensaje: 'No tienes permisos de administrador.',
    //   redireccion: '/'
    // }
  ];

  for (const regla of reglas) {
    if (!regla.condicion) {
      console.warn(regla.mensaje);
      return router.parseUrl(regla.redireccion);
    }
  }


  return true;
};
