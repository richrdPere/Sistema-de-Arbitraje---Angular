import { Component } from '@angular/core';
import { AdjudicadorSideMenuHeader } from "./adjudicador-side-menu-header/adjudicador-side-menu-header.component";
import { AdjudicadorSideMenuOptions } from "./adjudicador-side-menu-options/adjudicador-side-menu-options.component";

@Component({
  selector: 'adjudicador-side-menu',
  imports: [AdjudicadorSideMenuHeader, AdjudicadorSideMenuOptions],
  templateUrl: './adjudicador-side-menu.component.html',
})
export class AdjudicadorSideMenuComponent { }
