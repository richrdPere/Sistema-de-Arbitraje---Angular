import { Component } from '@angular/core';
import { ParticipeSideMenuOptionsComponent } from './participe-side-menu-options/participe-side-menu-options.component';
import { ParticipeSideMenuHeaderComponent } from './participe-side-menu-header/participe-side-menu-header.component';

@Component({
  selector: 'participe-side-menu',
  imports: [ParticipeSideMenuHeaderComponent, ParticipeSideMenuOptionsComponent],
  templateUrl: './participe-side-menu.component.html',
})
export class ParticipeSideMenuComponent { }
