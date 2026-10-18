import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

// =========================================================
// INTERFACES
// =========================================================
interface FooterLink {
  label: string;
  path: string;
}

interface FooterSection {
  title: string;
  links: readonly FooterLink[];
}

@Component({
  selector: 'footer-public',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgClass,
  ],
  templateUrl: './footer-public.component.html',
  styles: ``,
})
export class FooterPublicComponent {
  readonly currentYear = new Date().getFullYear();

  // =========================================================
  // SECCIONES Y RUTAS
  // =========================================================
  readonly footerSections: readonly FooterSection[] = [
    {
      title: 'Servicios',
      links: [
        {
          label: 'Centro de Arbitraje',
          path: '/arbitraje',
        },
        {
          label: 'JPRD',
          path: '/jprd',
        },
        {
          label: 'Mesa de Partes',
          path: '/ser_mesa_partes',
        },
        {
          label: 'Trazabilidad Documentaria',
          path: '/auth/login',
        },
      ],
    },
    {
      title: 'Institucional',
      links: [
        {
          label: 'Unidad de Gobierno',
          path: '/unidad_gobierno',
        },
        {
          label: 'Licencias',
          path: '/licencia',
        },
        {
          label: 'Banco de Laudos',
          path: '/laudos',
        },
        {
          label: 'Banco de Decisiones',
          path: '/desiciones',
        },
      ],
    },
    {
      title: 'Empresa',
      links: [
        {
          label: 'Nosotros',
          path: '/about',
        },
        {
          label: 'Contáctanos',
          path: '/contacto',
        },
      ],
    },
  ];
}
