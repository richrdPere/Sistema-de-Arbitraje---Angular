import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface FooterSection {
  title: string;
  links: { label: string; path: string; activeClass?: string }[];
}


@Component({
  selector: 'app-footer',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './footer.component.html',
})
export class FooterComponent {

  // Lista dinámica de rutas
  footerSections: FooterSection[] = [
    {
      title: 'Servicios',
      links: [
        { label: 'Centro de Arbitraje', path: '/arbitraje' },
        { label: 'JPRD', path: '/jprd' },
        { label: 'Mesa de Partes', path: '/ser_mesa_partes' },
        { label: 'Trazabilidad Documentaria', path: '/trazabilidad' },
      ],
    },
    {
      title: 'Institucional',
      links: [
        { label: 'Unidad de Gobierno', path: '/unidad_gobierno' },
        { label: 'Licencias', path: '/licencia' },
        { label: 'Banco de Laudos', path: '/laudos' },
        { label: 'Banco de Decisiones', path: '/desiciones' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Nosotros', path: '/about' },
        { label: 'Contáctanos', path: '/contacto' },
      ],
    },
  ];
}
