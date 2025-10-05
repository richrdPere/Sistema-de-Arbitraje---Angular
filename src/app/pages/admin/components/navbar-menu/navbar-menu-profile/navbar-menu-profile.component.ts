import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// import { AdminService } from 'src/app/services/admin.service';


export interface MenuOptions {
  label: string;
  icon: string; // Ruta al SVG
  route: string;
}

@Component({
  selector: 'app-navbar-menu-profile',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar-menu-profile.component.html',
})
export class NavbarMenuProfileComponent {

  // variables
  public name: string = '';
  public email: string = '';
  public avatar: String = '';


  // constructor(
  //   private _adminService: AdminService,
  //   private _router: Router
  // ) {
  //   const usuario = _adminService.getUsuario()

  //   if (usuario) {
  //     this.name = usuario.firstName;
  //     this.email = usuario.email;
  //     this.avatar = usuario.avatar;
  //   }


  //   console.log("name", this.name);
  //   console.log("email", this.email);
  // }

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
    // this._adminService.logout();

    // iziToast.info({
    //   title: 'Sesión cerrada',
    //   message: 'Has cerrado sesión correctamente',
    //   position: 'topRight',
    // });
    // this._router.navigate(['/login']);
  }

}
