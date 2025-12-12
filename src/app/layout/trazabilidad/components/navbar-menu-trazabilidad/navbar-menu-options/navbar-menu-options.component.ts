import { Component } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { NotificationBellComponent } from "src/app/notifications/components/notification-bell/notification-bell.component";

@Component({
  selector: 'navbar-menu-options',
  imports: [NotificationBellComponent],
  templateUrl: './navbar-menu-options.component.html',
})
export class NavbarMenuOptionsComponent {
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
