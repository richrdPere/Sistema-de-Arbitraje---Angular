import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// IziToast
import iziToast from 'izitoast';
// Interface
import { MenuOptions } from 'src/app/interfaces/components/MenuOptions';
// Servicio
import { AuthService } from 'src/app/services/auth.service';
import { PerfilService } from 'src/app/services/perfil.service';


@Component({
  selector: 'menu-profile-secretaria',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu-profile-secretaria.component.html',
})
export class MenuProfileSecretariaComponent {

  // variables
  public name: string = '';
  public email: string = '';
  public avatar: String = '';


  constructor(
    private _authService: AuthService,
    private _router: Router,
    private perfilService: PerfilService
  ) {
    const usuario = _authService.getUser()

    if (usuario) {
      this.name = usuario.nombre;
      this.email = usuario.correo;
      this.avatar = `${this.perfilService.envs.url_image}${usuario.foto_perfil}`;
    }
  }

  menuOptions: MenuOptions[] = [
    {
      icon: 'assets/icons/navbar/perfil.svg',
      label: 'Perfil',
      route: '/secretaria/perfil',
    },
    {
      icon: 'assets/icons/navbar/settings.svg',
      label: 'Configuración',
      route: '/dashboard/configuracion',
    },
    {
      icon: 'assets/icons/navbar/sign_out.svg',
      label: 'Cerrar Sesión',
      route: '/trazabilidad',
    },

  ];

  logout() {
    this._authService.logout();

    iziToast.info({
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente',
      position: 'bottomRight',
    });
    this._router.navigate(['/trazabilidad']);
  }

}
