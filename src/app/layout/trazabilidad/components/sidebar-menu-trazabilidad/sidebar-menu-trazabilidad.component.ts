import { Component } from '@angular/core';
import { SideMenuOptionsComponent } from "./side-menu-options/side-menu-options.component";
import { SideMenuHeaderComponent } from "./side-menu-header/side-menu-header.component";

@Component({
  selector: 'sidebar-menu-trazabilidad',
  imports: [SideMenuOptionsComponent, SideMenuHeaderComponent],
  templateUrl: './sidebar-menu-trazabilidad.component.html',
})
export class SidebarMenuTrazabilidadComponent {

}
