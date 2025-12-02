import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavbarMenuOptionsComponent } from "./navbar-menu-options/navbar-menu-options.component";
import { NavbarMenuProfileComponent } from "./navbar-menu-profile/navbar-menu-profile.component";

export interface MenuOptions {
  label: string;
  icon: string; // Ruta al SVG
  route: string;
}

@Component({
  selector: 'navbar-menu-trazabilidad',
  imports: [NavbarMenuOptionsComponent, NavbarMenuProfileComponent],
  templateUrl: './navbar-menu-trazabilidad.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarMenuTrazabilidadComponent {

}
