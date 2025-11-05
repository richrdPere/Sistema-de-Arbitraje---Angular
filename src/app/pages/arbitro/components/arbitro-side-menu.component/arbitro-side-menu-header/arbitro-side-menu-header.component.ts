import { Component } from '@angular/core';
import { environment } from '@environments/environment';

@Component({
  selector: 'arbitro-side-menu-header',
  imports: [],
  templateUrl: './arbitro-side-menu-header.component.html',
})
export class ArbitroSideMenuHeader {
  envs = environment;
}
