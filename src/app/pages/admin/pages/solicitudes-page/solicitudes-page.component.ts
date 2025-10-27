import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-solicitudes-page',
  imports: [ReactiveFormsModule],
  templateUrl: './solicitudes-page.component.html',
})
export class SolicitudesPageComponent implements OnInit {

  // Variables
  fb = inject(FormBuilder);
  formUtils = FormUtils;



  solicitudes: any[] = [];
  loading = true;
  paginaActual = 1;
  totalPaginas = 1;


  // MENU DESPLEGABLE
  menuAbierto: number | null = null;

  toggleDropdown(index: number, event: MouseEvent) {
    // Si se vuelve a hacer click en el mismo menú, se cierra
    event.stopPropagation(); // Evita que se cierre inmediatamente
    this.menuAbierto = this.menuAbierto === index ? null : index;
  }

  cerrarDropdown() {
    this.menuAbierto = null;
  }

  // MODAL
  modalVisible = false;
  tramiteSeleccionado: any = null;
  nuevoEstado: string = '';

  abrirModal(solicitud: any) {
    this.tramiteSeleccionado = solicitud;
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.tramiteSeleccionado = null;
    this.nuevoEstado = '';
  }

  constructor(private tramiteService: TramiteMPVService) { }


  ngOnInit(): void {
    this.cargarTramites();
  }

  cargarTramites(pagina: number = 1): void {
    this.loading = true;
    this.tramiteService.listarTramites(pagina).subscribe({
      next: (data) => {
        console.log('Respuesta del backend:', data);
        this.solicitudes = data.tramites;
        this.paginaActual = data.pagina_actual;
        this.totalPaginas = data.total_paginas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al listar trámites:', err);
        this.loading = false;
      },
    });
  }

  siguientePagina(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.cargarTramites(this.paginaActual + 1);
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.cargarTramites(this.paginaActual - 1);
    }
  }

  confirmarCambioEstado() {
    if (!this.tramiteSeleccionado || !this.nuevoEstado) return;

    this.tramiteService.actualizarEstado(this.tramiteSeleccionado.id, this.nuevoEstado)
      .subscribe({
        next: (resp) => {
          alert(`Solicitud ${this.nuevoEstado === 'aprobada' ? 'aprobada' : 'rechazada'} correctamente`);
          this.cerrarModal();
          this.cargarTramites(); // vuelve a cargar la tabla
        },
        error: (err) => {
          console.error('Error al actualizar estado:', err);
          alert('Error al actualizar el estado.');
        }
      });
  }
  // cambiarEstado(tramite: any, event: any) {
  //   const nuevoEstado = event.target.value;
  //   this.tramiteService.actualizarEstado(tramite.id_tramite, nuevoEstado).subscribe({
  //     next: () => {
  //       tramite.estado = nuevoEstado;
  //       alert(`Estado actualizado a ${nuevoEstado}`);
  //     },
  //     error: (err) => console.error('Error actualizando estado:', err)
  //   });
  // }


  // Ejemplo de funciones base:


}



// solicitudes = [
//   {
//     expediente: '1-2025/JPRD-RENA',
//     tipo: 'Creación de expediente',
//     usuario: 'Ana Torres',
//     fecha: '2025-10-01',
//     estado: 'Pendiente',
//     correo: '',
//     condicion: '',
//   },
//   {
//     expediente: '002-2025/CA-RENA',
//     tipo: 'Cambio de rol',
//     usuario: 'José Vega',
//     fecha: '2025-09-30',
//     estado: 'Aprobada',
//      correo: '',
//     condicion: '',
//   },
//   {
//     expediente: '001-2025/CA-RENA',
//     tipo: 'Restablecer contraseña',
//     usuario: 'Lucía Fernández',
//     fecha: '2025-09-29',
//     estado: 'Rechazada',
//      correo: '',
//     condicion: '',
//   },
//   {
//     expediente: '001-2025/CA-RENA',
//     tipo: 'Actualización de datos',
//     usuario: 'Pedro Morales',
//     fecha: '2025-10-02',
//     estado: 'Pendiente',
//      correo: '',
//     condicion: '',
//   },
//   {
//     expediente: '001-2025/CA-RENA',
//     tipo: 'Solicitud de acceso',
//     usuario: 'Carmen Silva',
//     fecha: '2025-10-03',
//     estado: 'Aprobada',
//      correo: '',
//     condicion: '',
//   },
// ];
