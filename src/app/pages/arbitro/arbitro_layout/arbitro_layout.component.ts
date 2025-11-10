import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ArbitroSideMenuComponent } from "../components/arbitro-side-menu.component/arbitro-side-menu.component";
import { ArbitroNavbarMenuComponent } from "../components/arbitro-navbar-menu/arbitro-navbar-menu.component";

// Service
import { AuthService } from 'src/app/services/auth.service';

export interface MenuOptions {
  label: string;
  icon: string; // Ruta al SVG
  route: string;
}

@Component({
  selector: 'app-arbitro-layout',
  imports: [RouterOutlet, ArbitroSideMenuComponent, ArbitroNavbarMenuComponent],
  templateUrl: './arbitro_layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArbitroLayoutComponent {

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
