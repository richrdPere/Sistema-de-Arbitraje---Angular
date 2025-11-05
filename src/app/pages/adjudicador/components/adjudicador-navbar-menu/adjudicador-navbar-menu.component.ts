import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AdjudicadorNavbarMenuOptionsComponent } from "./adjudicador-navbar-menu-options/adjudicador-navbar-menu-options.component";
import { AdjudicadorNavbarMenuProfileComponent } from "./adjudicador-navbar-profile.component/adjudicador-navbar-profile.component";


export interface MenuOptions {
  label: string;
  icon: string; // Ruta al SVG
  route: string;
}


@Component({
  selector: 'adjudicador-navbar-menu',
  imports: [AdjudicadorNavbarMenuOptionsComponent, AdjudicadorNavbarMenuProfileComponent],
  templateUrl: './adjudicador-navbar-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdjudicadorNavbarMenuComponent { }
