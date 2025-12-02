import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

// Components
import { NavbarMainComponent } from "../components/navbar-main/navbar-main.component";
import { NavbarFooterComponent } from "../components/navbar-footer/navbar-footer.component";

// Service
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, NavbarMainComponent, NavbarFooterComponent],
  templateUrl: './layout_main.component.html',
})
export class LayoutComponentMain implements OnInit {

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
