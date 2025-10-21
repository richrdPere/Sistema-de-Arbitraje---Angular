import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

// IziToast
import iziToast from 'izitoast';

// Interface
import { MenuOptions } from 'src/app/interfaces/components/MenuOptions';

// Servicio
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'navbar-menu-profile',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar-menu-profile.component.html',
})
export class NavbarMenuProfileComponent {

  // variables
  public name: string = '';
  public email: string = '';
  public avatar: String = '';


  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {
    const usuario = _authService.getUser()

    if (usuario) {
      this.name = usuario.nombre;
      this.email = usuario.correo;
      // this.avatar = usuario.avatar;
    }

  }

  menuOptions: MenuOptions[] = [
    {
      icon: 'assets/icons/navbar/perfil.svg',
      label: 'Perfil',
      route: '/dashboard/perfil',
    },
    {
      icon: 'assets/icons/navbar/settings.svg',
      label: 'Configuración',
      route: '/dashboard/configuracion',
    },
    {
      icon: 'assets/icons/navbar/sign_out.svg',
      label: 'Cerrar Sesión',
      route: '/login',
    },

  ];

  logout() {
    this._authService.logout();

    iziToast.info({
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente',
      position: 'bottomRight',
    });
    this._router.navigate(['/login']);
  }

}
