import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ArbitroNavbarMenuOptionsComponent } from "./arbitro-navbar-menu-options/arbitro-navbar-menu-options.component";
import { ArbitroNavbarMenuProfileComponent } from "./arbitro-navbar-menu-profile/arbitro-navbar-menu-profile.component";

export interface MenuOptions {
  label: string;
  icon: string; // Ruta al SVG
  route: string;
}

@Component({
  selector: 'arbitro-navbar-menu',
  imports: [ArbitroNavbarMenuOptionsComponent, ArbitroNavbarMenuProfileComponent],
  templateUrl: './arbitro-navbar-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArbitroNavbarMenuComponent { }
