import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarMenuOptionsComponent } from "./navbar-menu-options/navbar-menu-options.component";
import { NavbarMenuProfileComponent } from "./navbar-menu-profile/navbar-menu-profile.component";

@Component({
  selector: 'navbar-menu',
  imports: [NavbarMenuOptionsComponent, NavbarMenuProfileComponent],
  templateUrl: './navbar-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarMenuComponent { }
