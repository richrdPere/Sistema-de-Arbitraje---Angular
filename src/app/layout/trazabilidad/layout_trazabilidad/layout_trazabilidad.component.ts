import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Pipe
import { CapitalizePipe } from 'src/app/pipes/capitalize.pipe';

// Service
import { AuthService } from 'src/app/services/auth.service';
import { NavbarMenuTrazabilidadComponent } from "../components/navbar-menu-trazabilidad/navbar-menu-trazabilidad.component";
import { SidebarMenuTrazabilidadComponent } from "../components/sidebar-menu-trazabilidad/sidebar-menu-trazabilidad.component";

@Component({
  selector: 'app-layout-trazabilidad.component',
  imports: [RouterOutlet, CapitalizePipe, NavbarMenuTrazabilidadComponent, SidebarMenuTrazabilidadComponent],
  templateUrl: './layout_trazabilidad.component.html',
})
export class LayoutTrazabilidadComponent {

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
