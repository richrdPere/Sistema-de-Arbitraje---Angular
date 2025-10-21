import { Component } from '@angular/core';
import { environment } from '@environments/environment';

@Component({
  selector: 'side-menu-header-secretaria',
  imports: [],
  templateUrl: './side-menu-header-secretaria.component.html',
})
export class SideMenuHeaderSecretariaComponent {
   envs = environment;
}
