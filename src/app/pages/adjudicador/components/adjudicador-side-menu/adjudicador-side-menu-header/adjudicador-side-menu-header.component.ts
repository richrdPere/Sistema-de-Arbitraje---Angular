import { Component } from '@angular/core';
import { environment } from '@environments/environment';

@Component({
  selector: 'adjudicador-side-menu-header',
  imports: [],
  templateUrl: './adjudicador-side-menu-header.component.html',
})
export class AdjudicadorSideMenuHeader {
  envs = environment;
}
