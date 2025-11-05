import { Component } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'adjudicador-navbar-menu-options',
  imports: [],
  templateUrl: './adjudicador-navbar-menu-options.component.html',
})
export class AdjudicadorNavbarMenuOptionsComponent {

  theme: string = 'light';

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.theme = this.themeService.getTheme();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.theme = this.themeService.getTheme();
  }


}
