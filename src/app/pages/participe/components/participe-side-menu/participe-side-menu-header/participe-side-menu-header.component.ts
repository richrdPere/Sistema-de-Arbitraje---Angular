import { Component } from '@angular/core';
import { environment } from '@environments/environment';

@Component({
  selector: 'participe-side-menu-header',
  imports: [],
  templateUrl: './participe-side-menu-header.component.html',
})
export class ParticipeSideMenuHeaderComponent {
  envs = environment;
}
