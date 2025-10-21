import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'menu-options-secretaria',
  imports: [],
  templateUrl: './menu-options-secretaria.component.html',
})
export class MenuOptionsSecretariaComponent implements OnInit {

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
