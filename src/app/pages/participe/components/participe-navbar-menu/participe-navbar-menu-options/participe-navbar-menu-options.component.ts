import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'participe-navbar-menu-options',
  imports: [],
  templateUrl: './participe-navbar-menu-options.component.html',
})
export class ParticipeNavbarMenuOptionsComponent implements OnInit {


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
