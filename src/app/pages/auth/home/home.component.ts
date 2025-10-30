import { Component } from '@angular/core';

interface NoticiaEvento {
  id: number;
  titulo: string;
  descripcion: string;
  icono: string;
  enlace: string;
}

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
})
export class HomeComponent {

  noticiasEventos: NoticiaEvento[] = [
    {
      id: 1,
      titulo: 'Mesa de Partes Virtual',
      descripcion:
        'Ingresa aquí si deseas presentar solicitudes, contestaciones, escritos y documentos en general.',
      icono: 'assets/icons/paper_pencil.svg',
      enlace: '/ser_mesa_partes'
    },
    {
      id: 2,
      titulo: 'Consulta de Expediente',
      descripcion:
        'Consulta el estado y avance de un arbitraje, una conciliación decisoria y una Junta de Disputas, para lo cual necesitará conocer el número de expediente que corresponda.',
      icono: 'assets/icons/search.svg',
      enlace: '/ser_consulta_expedientes'
    },
    {
      id: 3,
      titulo: 'Calculadora',
      descripcion:
        'Ingresa el monto y calcula la tarifa dependiendo si es cuantía determinada o indeterminada.',
      icono: 'assets/icons/calcule.svg',
      enlace: '/ser_calculadora'
    }
  ];

}
