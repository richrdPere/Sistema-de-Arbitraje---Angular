import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarMenuComponent } from "../components/navbar-menu/navbar-menu.component";
import { SideMenuComponent } from "../components/side-menu/side-menu.component";

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, SideMenuComponent, NavbarMenuComponent],
  templateUrl: './admin_layout.component.html',
})
export class AdminLayoutComponent { }
