import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-solicitudes-page',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './solicitudes-page.component.html',
})
export class SolicitudesPageComponent implements OnInit {

  // Variables
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  loading = true;
  mostrarModal = false;


  solicitudes: any[] = [];

  constructor(private tramiteService: TramiteMPVService) { }


  ngOnInit(): void {
    this.cargarTramites();
  }

  cargarTramites() {
    this.tramiteService.listarTramites().subscribe({
      next: (data) => {
        console.log('Respuesta del backend:', data);
        (this.solicitudes = data.rows),
          this.loading = false;
      },
      error: (err) => {
        console.error('Error al listar trámites:', err);
        this.loading = false;
      },
    });
  }

  cambiarEstado(tramite: any, event: any) {
    const nuevoEstado = event.target.value;
    this.tramiteService.actualizarEstado(tramite.id_tramite, nuevoEstado).subscribe({
      next: () => {
        tramite.estado = nuevoEstado;
        alert(`Estado actualizado a ${nuevoEstado}`);
      },
      error: (err) => console.error('Error actualizando estado:', err)
    });
  }

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
