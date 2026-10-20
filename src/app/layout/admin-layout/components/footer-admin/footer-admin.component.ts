import { Component } from '@angular/core';

@Component({
  selector: 'footer-admin',
  standalone: true,
  templateUrl: './footer-admin.component.html',
  host: {
    class: 'block',
  },
  styles: ``,
})
export class FooterAdminComponent {
  readonly currentYear = new Date().getFullYear();
}
