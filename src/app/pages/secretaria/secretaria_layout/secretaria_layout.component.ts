import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuSecretariaComponent } from "../components/side-menu-secretaria/side-menu-secretaria.component";
import { NavbarMenuSecretariaComponent } from "../components/navbar-menu-secretaria/navbar-menu-secretaria.component";

// Service
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-secretaria-layout',
  imports: [RouterOutlet, SideMenuSecretariaComponent, NavbarMenuSecretariaComponent],
  templateUrl: './secretaria_layout.component.html',
})
export class SecretariaLayoutComponent {

  rol: string = '';
  nombre: string = '';

  constructor(private _authService: AuthService,) {

    const usuario = _authService.getUser()

    if (usuario) {
      this.rol = usuario.rol;
      this.nombre = usuario.nombre;
    }
  }


}
