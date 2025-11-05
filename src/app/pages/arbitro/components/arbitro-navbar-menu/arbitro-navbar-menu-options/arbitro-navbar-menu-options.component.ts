import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'arbitro-navbar-menu-options',
  imports: [],
  templateUrl: './arbitro-navbar-menu-options.component.html',
})
export class ArbitroNavbarMenuOptionsComponent implements OnInit {

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
