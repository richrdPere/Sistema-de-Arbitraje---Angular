import { Component } from '@angular/core';
import { MenuOptionsSecretariaComponent } from "./menu-options-secretaria/menu-options-secretaria.component";
import { MenuProfileSecretariaComponent } from "./menu-profile-secretaria/menu-profile-secretaria.component";

// interface MenuOptions {
//   label: string;
//   icon: string; // Ruta al SVG
//   route: string;
// }


@Component({
  selector: 'navbar-menu-secretaria',
  imports: [MenuOptionsSecretariaComponent, MenuProfileSecretariaComponent],
  templateUrl: './navbar-menu-secretaria.component.html',
})
export class NavbarMenuSecretariaComponent { }
