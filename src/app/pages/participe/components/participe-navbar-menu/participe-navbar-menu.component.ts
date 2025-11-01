import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ParticipeNavbarMenuOptionsComponent } from "./participe-navbar-menu-options/participe-navbar-menu-options.component";
import { ParticipeNavbarMenuProfileComponent } from "./participe-navbar-menu-profile/participe-navbar-menu-profile.component";

export interface MenuOptions {
  label: string;
  icon: string; // Ruta al SVG
  route: string;
}

@Component({
  selector: 'participe-navbar-menu',
  imports: [ParticipeNavbarMenuOptionsComponent, ParticipeNavbarMenuProfileComponent],
  templateUrl: './participe-navbar-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipeNavbarMenuComponent { }
