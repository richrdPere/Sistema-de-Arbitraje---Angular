import { Component } from '@angular/core';
import { ArbitroSideMenuHeader } from "./arbitro-side-menu-header/arbitro-side-menu-header.component";
import { ArbitroSideMenuOptions } from "./arbitro-side-menu-options/arbitro-side-menu-options.component";

@Component({
  selector: 'arbitro-side-menu',
  imports: [ArbitroSideMenuHeader, ArbitroSideMenuOptions],
  templateUrl: './arbitro-side-menu.component.html',
})
export class ArbitroSideMenuComponent { }
