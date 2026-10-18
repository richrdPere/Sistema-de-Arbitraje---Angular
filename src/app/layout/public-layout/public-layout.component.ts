import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

// Componentes
import { NavbarPublicComponent } from './components/navbar-public/navbar-public.component';
import { FooterPublicComponent } from './components/footer-public/footer-public.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarPublicComponent,
    FooterPublicComponent,
  ],
  templateUrl: './public-layout.component.html',
  styles: ``
})
export class PublicLayoutComponent {

}
