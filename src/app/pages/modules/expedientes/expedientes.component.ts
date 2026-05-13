import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';

import { DatePipe } from '@angular/common';

import { FormUtils } from 'src/app/utils/form-utils';
import { CommonModule } from '@angular/common';
import { ExpedienteModalComponent } from "./expediente-modal/expediente-modal.component";


// Interface
import { Expediente } from 'src/app/interfaces/components/expediente';

// Izitoast
import iziToast from 'izitoast';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { GestionarParticipesComponent } from "./gestionar-participes/gestionar-participes.component";
import { VerHistorialComponent } from "./ver-historial/ver-historial.component";
import Swal from 'sweetalert2';
import { VerExpedienteComponent } from "./ver-expediente/ver-expediente.component";
import { DesignacionFormComponent } from "./designacion-form/designacion-form.component";

@Component({
  selector: 'app-expedientes',
  imports: [DatePipe, ReactiveFormsModule, FormsModule, CommonModule, RouterOutlet, ExpedienteModalComponent, GestionarParticipesComponent, VerHistorialComponent, VerExpedienteComponent, DesignacionFormComponent],
  templateUrl: './expedientes.component.html',
  styles: ``
})
export class ExpedientesComponent {

  // Expedientes
  expedientes: any = [];
  searchTimeout: any;

  // =========================
  // VARIABLES
  // =========================
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  formExpediente!: FormGroup;
  expedienteId: number | null = null;

  loading = true;
  mensajeError = '';
  mensajeExito = '';
  filtro: string = '';
  modoEdicion = false;
  mostrarModal = false;
  mostrarModalParticipes = false;
  mostrarModalFormDesignacion = false;
  mostrarModalHistorial = false;
  mostrarModalInfoExpediente = false;
  selectedExpedienteId?: number;
  expedienteSeleccionado: any | null = null;

  menuAbierto: number | null = null;

  rol: string = '';

  menuActivo: any = null;
  dropdownStyle: any = {};

  // Control de error (opcional)
  errorMessage: string = '';

  // Search y filtros
  search: string = '';
  rolFiltro: string = '';

  meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  anios: number[] = [];

  filtroMes: number | '' = '';
  filtroAnio: number | '' = '';
  filtroSearch = '';

  // Paginado
  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  pageSizeOptions = [5, 10, 20, 50];

  onPageSizeChange() {
    this.currentPage = 1; // vuelve a la primera página
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.cargarExpedientes();
  }

  cambiarLimite() {
    // this.limit = Number(this.limit);
    this.page = 1;
    this.cargarExpedientes();
  }

  toggleDropdown(event: MouseEvent, expediente: any) {
    event.stopPropagation();

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    this.menuActivo = expediente;

    this.dropdownStyle = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.right - 200}px`, // ancho del menú
    };
  }

  // Cerrar al hacer click fuera
  @HostListener('document:click')
  cerrarDropdown() {
    this.menuActivo = null;
  }

  // Constructor
  constructor(

    private expedienteService: ExpedientesService,
    private _authService: AuthService,
    private router: Router,
    private eRef: ElementRef) {

    const usuario = _authService.getUser()

    if (usuario) {
      this.rol = usuario.rol;
    }
  }

  // onInit
  ngOnInit(): void {

    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= anioActual - 5; i--) {
      this.anios.push(i);
    }

    this.formExpediente = this.fb.group({
      numero_expediente: ['', Validators.required],
      anio: ['', Validators.required],
      codigo: ['', Validators.required],
      titulo: ['', Validators.required],
      descripcion: [''],
      tipo: ['', Validators.required],
      estado: ['', Validators.required],
      estado_procesal: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_laudo: [''],
      fecha_resolucion: [''],
      fecha_cierre: ['']
    });


    this.cargarExpedientes();
  }

  aplicarFiltros() {
    this.page = 1; // reinicia paginación

    this.cargarExpedientes(
    );
  }


  abrirModal() {
    this.modoEdicion = false;
    this.expedienteSeleccionado = null;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.formExpediente.reset();
  }

  // Ejemplo de funciones base:
  verDocumentos(exp: any) { this.router.navigate([`app/expedientes/${exp.id_expediente}/documentos`]); }

  gestionarParticipesModal(exp: any) {
    this.expedienteSeleccionado = exp;

    console.log("Expediente seleccionado: ", exp);

    this.mostrarModalParticipes = true;
  }

  designacionFormModal(exp: any) {
    // this.expedienteId = exp.id_expediente;
    this.expedienteSeleccionado = { ...exp };
    this.mostrarModalFormDesignacion = true;
  }

  verHistorial(exp: any) {
    this.expedienteId = exp.id_expediente;
    this.mostrarModalHistorial = true;
  }

  verExpedienteInfo(exp: any) {
    this.expedienteId = exp.id_expediente;
    this.mostrarModalInfoExpediente = true;
  }

  editarExpediente(exp: Expediente): void {
    this.modoEdicion = true;
    this.expedienteSeleccionado = { ...exp };
    this.mostrarModal = true;
  }

  cerrarModalFormDesignacion() {
    this.mostrarModalFormDesignacion = false;
    this.expedienteSeleccionado = null;
    // this.expedienteId = null;
  }

  cerrarModalParticipes() {
    this.mostrarModalParticipes = false;
    this.expedienteSeleccionado = null;
  }

  cerrarModalHistorial() {
    this.mostrarModalHistorial = false;
    this.expedienteId = null;
  }



  eliminarExpediente(id_exp: number) {

    Swal.fire({
      title: '¿Eliminar expediente?',
      text: 'Esta acción eliminará el expediente PERMANENTEMENTE y no podrá recuperarse.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {

      if (result.isConfirmed) {

        // Loader
        Swal.fire({
          title: 'Eliminando expediente...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.expedienteService.deleteExpediente(id_exp).subscribe({
          next: (resp) => {

            Swal.fire({
              icon: 'success',
              title: 'Expediente eliminado',
              text: 'El expediente fue eliminado correctamente',
              timer: 2000,
              showConfirmButton: false
            });

            // Recargar tabla
            this.cargarExpedientes();
          },
          error: (err) => {

            Swal.fire({
              icon: 'error',
              title: 'No se pudo eliminar',
              text: err?.error?.message || 'Ocurrió un error al eliminar el expediente'
            });

            console.error(err);
          }
        });
      }
    });
  }

  cerrarModalInfo() {
    this.mostrarModalInfoExpediente = false;
    this.expedienteId = null;
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.cargarExpedientes();
    }, 200);
  }


  // =========================================================
  // 1.- LOAD EXPDIENTES
  // =========================================================
  cargarExpedientes() {
    this.loading = true;

    this.expedienteService.getExpedientesPaginated({
      page: this.page,
      limit: this.limit,
      nro_expediente: this.filtroSearch?.trim(),
      mes: this.filtroMes || undefined,
      anio: this.filtroAnio || undefined,

    }).subscribe({
      next: (resp) => {
        this.expedientes = resp.data;
        this.totalItems = resp.total;
        this.totalPages = resp.totalPages;
        this.currentPage = resp.page;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Error al cargar los expedientes';
      },
    });
  }

  // =========================
  // 6.- RESET FORMULARIO
  // =========================
  resetForm(): void {
    this.formExpediente.reset();
    // this.editMode = false;
    this.mostrarModal = false;
    this.selectedExpedienteId = undefined;
  }


  @HostListener('document:click', ['$event'])
  onClickFuera(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.cerrarDropdown();
    }
  }

  anularExpediente(id_exp: number) {

    console.log("id expediente: ", id_exp);

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción anulará el expediente y no podrá revertirse fácilmente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {

      if (result.isConfirmed) {

        // Loader mientras procesa
        Swal.fire({
          title: 'Anulando expediente...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.expedienteService.anularExpediente(id_exp).subscribe({
          next: (resp) => {

            Swal.fire({
              icon: 'success',
              title: 'Expediente anulado',
              text: 'El expediente fue anulado correctamente',
              timer: 2000,
              showConfirmButton: false
            });


            this.cargarExpedientes();

          },
          error: (err) => {

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err?.error?.message || 'Ocurrió un error al anular el expediente'
            });

            console.error(err);
          }
        });
      }
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'En trámite':
        return 'badge-info';

      case 'En espera':
        return 'badge-warning';

      case 'Suspendido':
        return 'badge-accent';

      case 'Concluido':
        return 'badge-success';

      case 'Archivado':
        return 'badge-neutral';

      case 'Anulado':
        return 'badge-error';

      default:
        return 'badge-ghost';
    }
  }

  abrirParticipe() {
    throw new Error('Method not implemented.');
  }

}
