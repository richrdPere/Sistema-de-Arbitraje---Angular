import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Componentes
import { NavbarAdminComponent } from './components/navbar-admin/navbar-admin.component';
import { SidebarAdminComponent } from './components/sidebar-admin/sidebar-admin.component';
import { FooterAdminComponent } from './components/footer-admin/footer-admin.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarAdminComponent,
    SidebarAdminComponent,
    FooterAdminComponent,
  ],
  templateUrl: './admin-layout.component.html',
  host: {
    class: 'block',
  },
  styles: ``,
})
export class AdminLayoutComponent {
  readonly drawerId = 'admin-drawer';
}
