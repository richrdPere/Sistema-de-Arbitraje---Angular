import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface NoticiaEvento {
  id: number;
  titulo: string;
  descripcion: string;
  icono: string;
  enlace: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {


  // ISOS
  imagesIsos: string[] = [
    'assets/isos/doc2.png',
    'assets/isos/doc3.png',
  ];

  // Cetificados
  imagesCertificados: string[] = [
    'assets/isos/doc1.png',
    'assets/isos/doc4.png',
  ]


  currentIndexIsos = 0;
  currentIndexCertificados = 0;
  itemsPerView = 4;

  currentIndex = 0;

  // Modal
  modalAbierto = false;
  imagenSeleccionada: string | null = null;


  // Noticias
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


  // Methods
  get visibleImagesIsos() {
    return this.imagesIsos.slice(
      this.currentIndexIsos,
      this.currentIndexIsos + this.itemsPerView
    );
  }

  get visibleImagesCertificados() {
    return this.imagesCertificados.slice(
      this.currentIndexCertificados,
      this.currentIndexCertificados + this.itemsPerView
    );
  }

  // ==== Navegación certificados ====
  nextCertificados() {
    if (this.currentIndexCertificados + this.itemsPerView < this.imagesCertificados.length) {
      this.currentIndexCertificados += this.itemsPerView;
    }
  }

  prevCertificados() {
    if (this.currentIndexCertificados - this.itemsPerView >= 0) {
      this.currentIndexCertificados -= this.itemsPerView;
    }
  }

  // ==== Navegación ISOS ====

  nextIsos() {
    if (this.currentIndexIsos + this.itemsPerView < this.imagesIsos.length) {
      this.currentIndexIsos += this.itemsPerView;
    }
  }

  prevIsos() {
    if (this.currentIndexIsos - this.itemsPerView >= 0) {
      this.currentIndexIsos -= this.itemsPerView;
    }
  }

  // ==== Modal ====

  abrirModal(img: string) {
    this.imagenSeleccionada = img;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.imagenSeleccionada = null;
  }
}
