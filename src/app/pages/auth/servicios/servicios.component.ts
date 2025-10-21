import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { RouterOutlet } from '@angular/router';


interface MenuServicios {
  title: string;
  description: string;
  route: string;
  // image_url: string;
  icon: string
}

@Component({
  selector: 'app-servicios',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './servicios.component.html',
})
export class ServiciosComponent {
  constructor(private router: Router) {

  }

  menuServicios: MenuServicios[] = [
    {
      title: 'MESA DE PARTES VIRTUALES',
      description: 'Ingresa aquí si deseas presentar solicitudes, contestaciones, escritos y documentos en general',
      route: '/ser_mesa_partes',
      icon: 'public/assets/icons/paper_pencil.svg'   //fa-solid fa-file-pen o assets/icons/paper_pencil.svg
    },
    {
      title: 'CONSULTA DE EXPEDIENTES',
      description: 'Consulta el estado y avance de un arbitraje, una conciliación decisoria y una Junta de Disputas, para lo cual necesitará conocer el número de expediente que corresponda.',
      route: '/ser_consulta_expedientes',
      icon: 'assets/icons/search.svg'
    },
    {
      title: 'CALCULADORA',
      description: 'Ingresa el monto y calcula la tarifa dependiendo si es cuantía determinada o indeterminada.',
      route: '/ser_calculadora',
      icon: 'assets/icons/calcule.svg'
    },
    // {
    //   title: 'Geotecnia',
    //   description: 'Optimizamos tu diseño con análisis geotécnico preciso.',
    //   route: '/servicio-detalle',
    //   image_url: 'assets/img/servicios/servicio_geo4.png'
    // },
    // {
    //   title: 'Núcleo Orientado',
    //   description: 'Capacitación especializada en núcleo orientado.',
    //   route: '/servicio-detalle',
    //   image_url: 'assets/img/servicios/servicio_geo5.png'
    // },
    // {
    //   title: 'Peligros Geológicos',
    //   description: 'Ciencia aplicada para la gestión de peligros geólogicos.',
    //   route: '/servicio-detalle',
    //   image_url: 'assets/img/servicios/servicio_geo6.png'
    // },
    // {
    //   title: 'Curso de Geología',
    //   description: 'Aprende los fundamentos de la geología con expertos y accede a material interactivo.',
    //   route: '',
    //   image_url: 'assets/img/servicios/servicio_geo1.jpg'
    // },
    // {
    //   title: 'Mapas Geológicos',
    //   description: 'Accede a mapas interactivos y visualiza información detallada sobre suelos y rocas.',
    //   route: '',
    //   image_url: 'assets/img/servicios/servicio_geo2.jpg'
    // },
    // {
    //   title: 'Consultorías Especializadas',
    //   description: 'Asesoría personalizada para tus proyectos de minería, exploración y geología.',
    //   route: '',
    //   image_url: 'assets/img/servicios/servicio_geo3.jpg'
    // },
  ];


}
