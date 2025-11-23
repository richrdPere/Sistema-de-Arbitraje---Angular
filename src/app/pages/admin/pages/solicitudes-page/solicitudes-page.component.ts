import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { AuthService } from 'src/app/services/auth.service';

// Pipes
import { DatePipe } from '@angular/common';
import { SolicitudComponent } from '../../../adjudicador/pages/solicitud/solicitud.component';


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
  solicitudesAprobadas: any[] = [];
  solicitudesRechazadas: any[] = [];

  // Nuevo campo para razón o comentario
  razonRechazo: string = '';

  loading = true;
  paginaActual = 1;
  totalPaginas = 1;

  usuario: any = null;
  rol: string = '';

  // Filtros
  search = '';
  estado = '';
  tipo = '';
  fecha_inicio = '';
  fecha_fin = '';
  filtroSearch: string = '';
  filtroTipo: string = '';
  filtroEstado: string = '';
  solicitudesFiltradas: any[] = [];

  // Dropdown
  menuAbierto: number | null = null;


  menuPosX = 0;
  menuPosY = 0;

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
    this.razonRechazo = ''; // limpiar cada vez que se abra el modal
  }

  cerrarModal() {
    this.modalVisible = false;
    this.tramiteSeleccionado = null;
    this.nuevoEstado = '';
    this.razonRechazo = '';
  }

  constructor(
    private tramiteService: TramiteMPVService,
    private expedientesService: ExpedientesService,
    private _authService: AuthService
  ) {

    this.usuario = _authService.getUser()

    if (this.usuario) {
      this.rol = this.usuario.rol;
    }
  }


  ngOnInit(): void {
    this.cargarTramites();
  }

  /**
 * Carga todos los trámites y los separa según su estado
 */
  cargarTramites(page: number = 1): void {
    this.loading = true;

    const filtros: any = {
      page,
      limit: 20,
      rol: this.rol,
      search: this.search,
      estado: this.estado,
      tipo: this.tipo,
      fecha_inicio: this.fecha_inicio,
      fecha_fin: this.fecha_fin
    };

    // Si es usuario, debe enviarse el id_usuario
    if (this.rol === 'usuario') {
      filtros.id_usuario = this.usuario.id_usuario;
    }

    this.tramiteService.listarTramites(filtros).subscribe({
      next: (data) => {
        const tramites = data.tramites || [];

        console.log('Respuesta del backend:', data);


        // Clasificación por estado
        this.solicitudes = tramites.filter(
          (t: any) => t.estado === 'pendiente'
        );
        this.solicitudesAprobadas = tramites.filter(
          (t: any) => t.estado === 'aprobada'
        );
        this.solicitudesRechazadas = tramites.filter(
          (t: any) => t.estado === 'rechazada'
        );


        console.log(' Pendientes:', this.solicitudes);
        console.log(' Aprobadas:', this.solicitudesAprobadas);
        console.log(' Rechazadas:', this.solicitudesRechazadas);

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

    const tramite = this.tramiteSeleccionado;
    const nuevoEstadoTramite = this.nuevoEstado;

    // ================================
    // 1. Preparamos payload
    // ================================
    const payload = {
      estado: nuevoEstadoTramite,
      id_expediente: tramite.id_expediente,
      usuario_responsable: this.usuario?.nombre || 'Administrador del sistema',
      razon: this.razonRechazo || null,
      correo_solicitante: tramite.correo,
      nombre_solicitante: tramite.solicitante,
      // correo_asociado: { ... }   <-- si luego usas webhooks, aquí entra
    };

    // console.log("NOMBRE SOLICITANTE", tramite.solicitante);

    // 1.- Actualizamos primero el estado del trámite
    this.tramiteService.actualizarEstado(
      tramite.id, payload
    )
      .subscribe({
        next: () => {
          console.log(` Trámite ${tramite.id} actualizado a: ${nuevoEstadoTramite}`);

          //  Ahora actualizamos el expediente relacionado
          const expedienteId = tramite.expediente_id; // asegúrate que el campo existe en tu respuesta
          if (expedienteId) {
            // Definimos el nuevo estado para el expediente según el trámite
            const nuevoEstadoExpediente =
              nuevoEstadoTramite === 'aprobada' ? 'En trámite' : 'Suspendido';

            this.expedientesService
              .actualizarExpediente(expedienteId, { estado: nuevoEstadoExpediente })
              .subscribe({
                next: () => {
                  console.log(` Expediente ${expedienteId} actualizado a: ${nuevoEstadoExpediente}`);
                  alert(`Solicitud ${nuevoEstadoTramite === 'aprobada' ? 'aprobada' : 'rechazada'} correctamente`);
                  this.cerrarModal();
                  this.cargarTramites(); // refrescamos la tabla
                },
                error: (err) => {
                  console.error(' Error al actualizar el expediente:', err);
                  alert('El trámite fue actualizado, pero ocurrió un error al actualizar el expediente.');
                  this.cerrarModal();
                  this.cargarTramites();
                },
              });
          } else {
            console.warn(' El trámite no tiene expediente asociado.');
            alert('El trámite fue actualizado, pero no se encontró expediente asociado.');
            this.cerrarModal();
            this.cargarTramites();
          }
        },
        error: (err) => {
          console.error('Error al actualizar estado del trámite:', err);
          alert('Error al actualizar el estado del trámite.');
        }
      });
  }

}
