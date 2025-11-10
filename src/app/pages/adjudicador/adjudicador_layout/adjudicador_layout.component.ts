import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdjudicadorSideMenuComponent } from "../components/adjudicador-side-menu/adjudicador-side-menu.component";
import { AdjudicadorNavbarMenuComponent } from "../components/adjudicador-navbar-menu/adjudicador-navbar-menu.component";

// Service
import { AuthService } from 'src/app/services/auth.service';

export interface MenuOptions {
  label: string;
  icon: string; // Ruta al SVG
  route: string;
}

@Component({
  selector: 'app-adjudicador-layout',
  imports: [RouterOutlet, AdjudicadorSideMenuComponent, AdjudicadorNavbarMenuComponent],
  templateUrl: './adjudicador_layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdjudicadorLayoutComponent {

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
