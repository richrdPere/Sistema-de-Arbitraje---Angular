import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarMenuComponent } from "../pages/auditoria-page/navbar-menu/navbar-menu.component";
import { SideMenuComponent } from "../components/side-menu/side-menu.component";

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, NavbarMenuComponent, SideMenuComponent],
  templateUrl: './admin_layout.component.html',
})
export class AdminLayoutComponent { }
