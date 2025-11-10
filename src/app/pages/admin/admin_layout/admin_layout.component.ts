import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarMenuComponent } from "../components/navbar-menu/navbar-menu.component";
import { SideMenuComponent } from "../components/side-menu/side-menu.component";

// Service
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, SideMenuComponent, NavbarMenuComponent],
  templateUrl: './admin_layout.component.html',
})
export class AdminLayoutComponent {

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
