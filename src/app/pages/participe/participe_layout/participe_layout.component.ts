import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ParticipeSideMenuComponent } from '../components/participe-side-menu/participe-side-menu.component';
import { ParticipeNavbarMenuComponent } from '../components/participe-navbar-menu/participe-navbar-menu.component';

// Service
import { AuthService } from 'src/app/services/auth.service';

export interface MenuOptions {
  label: string;
  icon: string; // Ruta al SVG
  route: string;
}

@Component({
  selector: 'app-participe-layout',
  imports: [RouterOutlet, ParticipeSideMenuComponent, ParticipeNavbarMenuComponent],
  templateUrl: './participe_layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipeLayoutComponent {
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
