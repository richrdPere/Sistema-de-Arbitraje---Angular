import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuSecretariaComponent } from "../components/side-menu-secretaria/side-menu-secretaria.component";
import { NavbarMenuSecretariaComponent } from "../components/navbar-menu-secretaria/navbar-menu-secretaria.component";

// Services
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';

// Pipe
import { CapitalizePipe } from 'src/app/pipes/capitalize.pipe';

@Component({
  selector: 'app-secretaria-layout',
  imports: [RouterOutlet, SideMenuSecretariaComponent, NavbarMenuSecretariaComponent, CapitalizePipe],
  templateUrl: './secretaria_layout.component.html',
})
export class SecretariaLayoutComponent {

  rol: string = '';
  nombre: string = '';

  constructor(
    private _authService: AuthService,
    private themeService: ThemeService
  ) {

    const usuario = _authService.getUser()

    if (usuario) {
      this.rol = usuario.rol;
      this.nombre = usuario.nombre;
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  isDarkTheme(): boolean {
    return this.themeService.getTheme() === 'dark';
  }


}
