import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ArbitroSideMenuComponent } from "../components/arbitro-side-menu.component/arbitro-side-menu.component";
import { ArbitroNavbarMenuComponent } from "../components/arbitro-navbar-menu/arbitro-navbar-menu.component";

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
export class ArbitroLayoutComponent { }
