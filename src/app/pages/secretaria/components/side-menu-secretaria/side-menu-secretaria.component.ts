import { Component } from '@angular/core';
import { SideMenuOptionsSecretariaComponent } from "./side-menu-options-secretaria/side-menu-options-secretaria.component";
import { SideMenuHeaderSecretariaComponent } from "./side-menu-header-secretaria/side-menu-header-secretaria.component";

@Component({
  selector: 'side-menu-secretaria',
  imports: [SideMenuOptionsSecretariaComponent, SideMenuHeaderSecretariaComponent],
  templateUrl: './side-menu-secretaria.component.html',
})
export class SideMenuSecretariaComponent { }
