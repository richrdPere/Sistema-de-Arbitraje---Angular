import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Subject, Subscription, finalize, firstValueFrom, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

// Services
import { ExpedientesService } from 'src/app/pages/features/expedientes/services/expedientes.service';

// Interfaces
import { ExpedienteEstado, ExpedienteEstadoProcesal, ExpedienteOrigen, ExpedientePaginadoItem, ExpedientesPaginadosFilters, ExpedienteTipo } from 'src/app/pages/features/expedientes/interfaces';

// Componentes
import { ExpedienteModalComponent } from './components/expediente-modal/expediente-modal.component';
import { VerHistorialComponent } from './components/ver-historial/ver-historial.component';
import { VerExpedienteComponent } from './components/ver-expediente/ver-expediente.component';
import { DesignacionFormComponent } from './components/designacion-form/designacion-form.component';

@Component({
  selector: 'app-expedientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,

    ExpedienteModalComponent,
    VerHistorialComponent,
    VerExpedienteComponent,
    DesignacionFormComponent,
  ],
  templateUrl: './expedientes.component.html',
})
export class ExpedientesComponent implements OnInit, OnDestroy {

  // *********************************************************
  // EXPEDIENTES
  // *********************************************************

  expedientes: ExpedientePaginadoItem[] = [];

  isLoading = false;
  errorMessage = '';

  // Compatibilidad con el HTML anterior.
  mostrarFiltrosAvanzados = false;
  get loading(): boolean {
    return this.isLoading;
  }

  // *********************************************************
  // FILTROS
  // *********************************************************

  searchBusqueda = '';

  estadoBusqueda: ExpedienteEstado | '' = '';
  estadoProcesalBusqueda: ExpedienteEstadoProcesal | '' = '';
  tipoBusqueda: ExpedienteTipo | '' = '';
  origenBusqueda: ExpedienteOrigen | '' = '';

  responsableBusqueda: number | null = null;

  filtroMes: number | '' = '';
  filtroAnio: number | '' = '';

  searchTimeout: ReturnType<typeof setTimeout> | undefined;

  // *********************************************************
  // SELECTORES
  // *********************************************************

  readonly estadosDisponibles: {
    value: ExpedienteEstado;
    label: string;
  }[] = [
      { value: 'EN_ESPERA', label: 'En espera' },
      { value: 'EN_TRAMITE', label: 'En trámite' },
      { value: 'SUSPENDIDO', label: 'Suspendido' },
      { value: 'CONCLUIDO', label: 'Concluido' },
      { value: 'ARCHIVADO', label: 'Archivado' },
      { value: 'ANULADO', label: 'Anulado' },
    ];

  readonly tiposDisponibles: {
    value: ExpedienteTipo;
    label: string;
  }[] = [
      {
        value: 'ARBITRAJE_DE_EMERGENCIA',
        label: 'Arbitraje de emergencia',
      },
      {
        value: 'ARBITRAJE_AD_HOC',
        label: 'Arbitraje ad hoc',
      },
      {
        value: 'ARBITRAJE_INSTITUCIONAL',
        label: 'Arbitraje institucional',
      },
    ];

  readonly origenesDisponibles: {
    value: ExpedienteOrigen;
    label: string;
  }[] = [
      { value: 'MPV', label: 'Mesa de Partes Virtual' },
      { value: 'MANUAL', label: 'Registro manual' },
    ];

  readonly estadosProcesalesDisponibles:
    ExpedienteEstadoProcesal[] = [
      'Prearbitral',
      'Instalación',
      'Postulatoria',
      'Fijación de puntos controvertidos',
      'Admisión de medios probatorios',
      'Actuación pericial',
      'Actuación probatoria',
      'Cierre de etapa probatoria',
      'Alegatos',
      'Audiencia',
      'Plazo para laudar',
      'Plazo para resolver pedido contra Laudo Arbitral',
      'Concluido con Laudo Arbitral Consentido',
      'Concluido con pedido contra Laudo Arbitral',
      'Recusación de arbitro',
      'Recusación de adjudicador',
      'Reconstitución de Tribunal Arbitral',
      'Reconstitución de JPRD',
    ];

  readonly meses = [
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

  // *********************************************************
  // PAGINACIÓN
  // *********************************************************

  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  readonly pageSizeOptions = [5, 10, 20, 50];

  // *********************************************************
  // MODALES
  // *********************************************************

  mostrarModal = false;
  modoEdicion = false;

  expedienteSeleccionado: ExpedientePaginadoItem | null = null;
  expedienteId: number | null = null;

  mostrarModalHistorial = false;
  mostrarModalInfoExpediente = false;
  mostrarModalParticipes = false;
  mostrarModalFormDesignacion = false;

  // *********************************************************
  // MENÚ DE ACCIONES
  // *********************************************************

  menuActivo: ExpedientePaginadoItem | null = null;

  dropdownStyle: {
    top?: string;
    left?: string;
  } = {};

  // *********************************************************
  // OPERACIONES EN CURSO
  // *********************************************************

  readonly expedientesEnOperacion = new Set<number>();

  // *********************************************************
  // SUSCRIPCIONES
  // *********************************************************

  private listadoSubscription?: Subscription;
  private readonly destruir$ = new Subject<void>();
  private destruido = false;

  constructor(
    private readonly expedienteService: ExpedientesService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
  ) { }

  // *********************************************************
  // CICLO DE VIDA
  // *********************************************************

  ngOnInit(): void {
    const anioActual = new Date().getFullYear();

    this.anios = Array.from(
      { length: 6 },
      (_, index) => anioActual - index,
    );

    this.getExpedientesPaginados();
  }

  ngOnDestroy(): void {
    this.destruido = true;

    clearTimeout(this.searchTimeout);

    this.destruir$.next();
    this.destruir$.complete();
  }

  // *********************************************************
  // 1. LISTADO PAGINADO
  // *********************************************************

  getExpedientesPaginados(): void {
    this.listadoSubscription?.unsubscribe();

    this.errorMessage = '';

    if (this.filtroMes !== '' && this.filtroAnio === '') {
      this.limpiarListado();

      this.errorMessage =
        'Selecciona un año para filtrar por mes.';

      this.cdr.markForCheck();
      return;
    }

    const filters: ExpedientesPaginadosFilters = {
      page: this.page,
      limit: this.limit,

      search: this.searchBusqueda.trim() || undefined,

      estado: this.estadoBusqueda || undefined,
      estado_procesal:
        this.estadoProcesalBusqueda || undefined,

      tipo: this.tipoBusqueda || undefined,
      origen: this.origenBusqueda || undefined,

      usuario_responsable_id:
        this.responsableBusqueda ?? undefined,

      mes: this.filtroMes === ''
        ? undefined
        : this.filtroMes,

      anio: this.filtroAnio === ''
        ? undefined
        : this.filtroAnio,

      sort_by: 'createdAt',
      sort_order: 'DESC',
    };

    this.isLoading = true;

    this.listadoSubscription = this.expedienteService
      .getExpedientesPaginados(filters)
      .pipe(
        takeUntil(this.destruir$),

        finalize(() => {
          this.isLoading = false;

          if (!this.destruido) {
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.limpiarListado();

            this.errorMessage =
              response.message ||
              'No se pudieron obtener los expedientes.';

            return;
          }

          const { items, paginacion } = response.data;

          this.expedientes = items;

          this.totalItems = paginacion.total;
          this.totalPages = paginacion.totalPages;

          this.page = paginacion.page;
          this.currentPage = paginacion.page;
          this.limit = paginacion.limit;
        },

        error: (error: unknown) => {
          this.limpiarListado();

          this.errorMessage = this.obtenerMensajeError(
            error,
            'No se pudieron obtener los expedientes.',
          );
        },
      });
  }

  // Mantiene compatibilidad con llamadas del HTML anterior.
  cargarExpedientes(): void {
    this.getExpedientesPaginados();
  }

  // *********************************************************
  // 2. BÚSQUEDA Y FILTROS
  // *********************************************************

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.reiniciarPagina();
      this.cerrarDropdown();
      this.getExpedientesPaginados();
    }, 300);
  }

  onFiltroChange(): void {
    clearTimeout(this.searchTimeout);

    this.reiniciarPagina();
    this.cerrarDropdown();
    this.getExpedientesPaginados();
  }

  aplicarFiltros(): void {
    this.onFiltroChange();
  }

  limpiarFiltros(): void {
    clearTimeout(this.searchTimeout);

    this.searchBusqueda = '';

    this.estadoBusqueda = '';
    this.estadoProcesalBusqueda = '';
    this.tipoBusqueda = '';
    this.origenBusqueda = '';

    this.responsableBusqueda = null;

    this.filtroMes = '';
    this.filtroAnio = '';

    this.reiniciarPagina();
    this.cerrarDropdown();

    this.getExpedientesPaginados();
  }

  // *********************************************************
  // 3. PAGINACIÓN
  // *********************************************************

  cambiarPagina(nuevaPagina: number): void {
    if (
      this.isLoading ||
      !Number.isInteger(nuevaPagina) ||
      nuevaPagina < 1 ||
      nuevaPagina > this.totalPages ||
      nuevaPagina === this.page
    ) {
      return;
    }

    clearTimeout(this.searchTimeout);

    this.page = nuevaPagina;
    this.currentPage = nuevaPagina;

    this.cerrarDropdown();
    this.getExpedientesPaginados();
  }

  cambiarLimite(): void {
    clearTimeout(this.searchTimeout);

    const nuevoLimite = Number(this.limit);

    this.limit = this.pageSizeOptions.includes(nuevoLimite)
      ? nuevoLimite
      : this.pageSizeOptions[0];

    this.reiniciarPagina();
    this.cerrarDropdown();

    this.getExpedientesPaginados();
  }

  onPageSizeChange(): void {
    this.cambiarLimite();
  }

  private reiniciarPagina(): void {
    this.page = 1;
    this.currentPage = 1;
  }

  // *********************************************************
  // 4. CREAR / EDITAR
  // *********************************************************

  abrirModal(): void {
    this.cerrarDropdown();

    this.modoEdicion = false;
    this.expedienteSeleccionado = null;
    this.mostrarModal = true;
  }

  editarExpediente(
    expediente: ExpedientePaginadoItem,
  ): void {
    if (
      !this.puedeEditar(expediente) ||
      this.estaEnOperacion(expediente.id_expediente)
    ) {
      return;
    }

    this.cerrarDropdown();

    this.modoEdicion = true;

    this.expedienteSeleccionado =
      this.copiarExpediente(expediente);

    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.expedienteSeleccionado = null;
  }

  onExpedienteGuardado(): void {
    const eraEdicion = this.modoEdicion;

    this.cerrarModal();

    if (!eraEdicion) {
      this.reiniciarPagina();
    }

    this.getExpedientesPaginados();
  }

  // *********************************************************
  // 5. DETALLE
  // *********************************************************

  verExpedienteInfo(
    expediente: ExpedientePaginadoItem,
  ): void {
    this.cerrarDropdown();

    this.expedienteId = expediente.id_expediente;
    this.mostrarModalInfoExpediente = true;
  }

  cerrarModalInfo(): void {
    this.mostrarModalInfoExpediente = false;
    this.expedienteId = null;
  }

  // *********************************************************
  // 6. HISTORIAL
  // *********************************************************

  verHistorial(
    expediente: ExpedientePaginadoItem,
  ): void {
    this.cerrarDropdown();

    this.expedienteId = expediente.id_expediente;
    this.mostrarModalHistorial = true;
  }

  cerrarModalHistorial(): void {
    this.mostrarModalHistorial = false;
    this.expedienteId = null;
  }

  // *********************************************************
  // 7. DOCUMENTOS
  // Conserva la ruta de navegación de tu componente anterior.
  // *********************************************************

  verDocumentos(
    expediente: ExpedientePaginadoItem,
  ): void {
    this.cerrarDropdown();

    void this.router.navigate([
      '/admin',
      'expedientes',
      expediente.id_expediente,
      'documentos',
    ]);
  }

  // *********************************************************
  // 8. PARTÍCIPES Y DESIGNACIÓN
  // El registro se gestiona en sus subcomponentes.
  // *********************************************************

  gestionarParticipesModal(
    expediente: ExpedientePaginadoItem,
  ): void {
    this.cerrarDropdown();

    this.expedienteSeleccionado =
      this.copiarExpediente(expediente);

    this.mostrarModalParticipes = true;
  }

  cerrarModalParticipes(): void {
    this.mostrarModalParticipes = false;
    this.expedienteSeleccionado = null;
  }

  designacionFormModal(
    expediente: ExpedientePaginadoItem,
  ): void {
    this.cerrarDropdown();

    this.expedienteSeleccionado =
      this.copiarExpediente(expediente);

    this.mostrarModalFormDesignacion = true;
  }

  cerrarModalFormDesignacion(): void {
    this.mostrarModalFormDesignacion = false;
    this.expedienteSeleccionado = null;
  }

  // *********************************************************
  // 9. ANULAR EXPEDIENTE
  // Solicita el motivo obligatorio antes de llamar al service.
  // *********************************************************

  async anularExpediente(
    idExpediente: number,
  ): Promise<void> {
    if (this.estaEnOperacion(idExpediente)) {
      return;
    }

    this.cerrarDropdown();
    this.expedientesEnOperacion.add(idExpediente);
    this.cdr.markForCheck();

    try {
      const resultado = await Swal.fire({
        icon: 'warning',
        title: '¿Anular expediente?',
        text: 'Ingresa el motivo de la anulación.',

        input: 'textarea',
        inputLabel: 'Motivo',
        inputPlaceholder: 'Describe el motivo de la anulación.',
        inputAutoTrim: true,

        showCancelButton: true,
        confirmButtonText: 'Sí, anular',
        cancelButtonText: 'Cancelar',

        confirmButtonColor: '#dc2626',

        reverseButtons: true,
        focusCancel: true,
        showLoaderOnConfirm: true,

        allowOutsideClick: () => !Swal.isLoading(),
        allowEscapeKey: () => !Swal.isLoading(),

        preConfirm: async (valor: string) => {
          if (this.destruido) {
            return false;
          }

          const motivo = valor?.trim();

          if (!motivo) {
            Swal.showValidationMessage(
              'El motivo de la anulación es obligatorio.',
            );

            return false;
          }

          try {
            const response = await firstValueFrom(
              this.expedienteService
                .anularExpediente(
                  idExpediente,
                  { motivo },
                )
                .pipe(takeUntil(this.destruir$)),
            );

            if (!response.success) {
              Swal.showValidationMessage(
                response.message ||
                'No se pudo anular el expediente.',
              );

              return false;
            }

            return response;
          } catch (error: unknown) {
            if (!this.destruido) {
              Swal.showValidationMessage(
                this.obtenerMensajeError(
                  error,
                  'No se pudo anular el expediente.',
                ),
              );
            }

            return false;
          }
        },
      });

      if (
        this.destruido ||
        !resultado.isConfirmed ||
        !resultado.value
      ) {
        return;
      }

      this.getExpedientesPaginados();

      void Swal.fire({
        icon: 'success',
        title: 'Expediente anulado',
        text: resultado.value.message,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error: unknown) {
      if (!this.destruido) {
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo completar la operación',
          text: this.obtenerMensajeError(
            error,
            'No se pudo anular el expediente.',
          ),
        });
      }
    } finally {
      this.expedientesEnOperacion.delete(idExpediente);

      if (!this.destruido) {
        this.cdr.markForCheck();
      }
    }
  }

  estaEnOperacion(idExpediente: number): boolean {
    return this.expedientesEnOperacion.has(idExpediente);
  }

  // *********************************************************
  // DISPONIBILIDAD DE ACCIONES
  // El backend conserva la validación definitiva.
  // *********************************************************

  puedeEditar(
    expediente: ExpedientePaginadoItem,
  ): boolean {
    return (
      expediente.estado === 'EN_ESPERA' ||
      expediente.estado === 'EN_TRAMITE' ||
      expediente.estado === 'SUSPENDIDO'
    );
  }

  puedeAnular(
    expediente: ExpedientePaginadoItem,
  ): boolean {
    return this.puedeEditar(expediente);
  }

  // *********************************************************
  // MENÚ DE ACCIONES
  // *********************************************************

  get hayFiltros(): boolean {
    return !!(
      this.searchBusqueda.trim() ||
      this.estadoBusqueda ||
      this.tipoBusqueda ||
      this.origenBusqueda ||
      this.estadoProcesalBusqueda ||
      this.filtroAnio ||
      this.filtroMes ||
      this.responsableBusqueda
    );
  }

  toggleDropdown(
    event: MouseEvent,
    expediente: ExpedientePaginadoItem,
  ): void {
    event.stopPropagation();

    if (
      this.menuActivo?.id_expediente === expediente.id_expediente
    ) {
      this.cerrarDropdown();
      return;
    }

    const button = event.currentTarget;

    if (!(button instanceof HTMLElement)) {
      return;
    }

    const rect = button.getBoundingClientRect();

    this.menuActivo = expediente;

    // Estas coordenadas corresponden a un menú position: fixed.
    this.dropdownStyle = {
      top: `${rect.bottom + 8}px`,
      left: `${Math.max(8, rect.right - 200)}px`,
    };
  }

  @HostListener('document:click')
  cerrarDropdown(): void {
    this.menuActivo = null;
    this.dropdownStyle = {};
  }

  // *********************************************************
  // ETIQUETAS
  // *********************************************************

  getEstadoLabel(estado: ExpedienteEstado): string {
    return this.estadosDisponibles.find(
      (opcion) => opcion.value === estado,
    )?.label ?? estado;
  }

  getEstadoClass(estado: ExpedienteEstado): string {
    const clases: Record<ExpedienteEstado, string> = {
      EN_ESPERA: 'badge-warning',
      EN_TRAMITE: 'badge-info',
      SUSPENDIDO: 'badge-accent',
      CONCLUIDO: 'badge-success',
      ARCHIVADO: 'badge-neutral',
      ANULADO: 'badge-error',
    };

    return clases[estado] ?? 'badge-ghost';
  }

  getTipoLabel(tipo: ExpedienteTipo): string {
    return this.tiposDisponibles.find(
      (opcion) => opcion.value === tipo,
    )?.label ?? tipo;
  }

  getOrigenLabel(origen: ExpedienteOrigen): string {
    return this.origenesDisponibles.find(
      (opcion) => opcion.value === origen,
    )?.label ?? origen;
  }

  getEstadoProcesalClass(
    estado: ExpedienteEstadoProcesal,
  ): string {
    switch (estado) {
      case 'Prearbitral':
        return 'badge-primary';

      case 'Instalación':
        return 'badge-success';

      case 'Audiencia':
        return 'badge-accent';

      case 'Plazo para laudar':
      case 'Plazo para resolver pedido contra Laudo Arbitral':
        return 'badge-warning';

      case 'Concluido con Laudo Arbitral Consentido':
      case 'Concluido con pedido contra Laudo Arbitral':
        return 'badge-info';

      default:
        return 'badge-neutral';
    }
  }

  mapearTipoArbitraje(
    tipo: ExpedienteTipo,
  ): 'EMERGENCIA' | 'AD_HOC' | 'TRIBUNAL' {
    switch (tipo) {
      case 'ARBITRAJE_DE_EMERGENCIA':
        return 'EMERGENCIA';

      case 'ARBITRAJE_INSTITUCIONAL':
        return 'TRIBUNAL';

      case 'ARBITRAJE_AD_HOC':
        return 'AD_HOC';
    }
  }

  // *********************************************************
  // HELPERS
  // *********************************************************

  private copiarExpediente(
    expediente: ExpedientePaginadoItem,
  ): ExpedientePaginadoItem {
    return {
      ...expediente,

      responsable: expediente.responsable
        ? { ...expediente.responsable }
        : null,
    };
  }

  private limpiarListado(): void {
    this.expedientes = [];
    this.totalItems = 0;
    this.totalPages = 0;
  }

  private obtenerMensajeError(
    error: unknown,
    mensajePredeterminado: string,
  ): string {
    if (typeof error === 'string') {
      return error.trim() || mensajePredeterminado;
    }

    const detalle = error as {
      error?: { message?: unknown } | string;
      message?: unknown;
    } | null;

    const mensajeBackend =
      typeof detalle?.error === 'string'
        ? detalle.error
        : detalle?.error?.message;

    if (
      typeof mensajeBackend === 'string' &&
      mensajeBackend.trim()
    ) {
      return mensajeBackend;
    }

    if (
      typeof detalle?.message === 'string' &&
      detalle.message.trim()
    ) {
      return detalle.message;
    }

    return mensajePredeterminado;
  }
}

// import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router, RouterOutlet } from '@angular/router';

// import { DatePipe } from '@angular/common';

// import { FormUtils } from 'src/app/utils/form-utils';
// import { CommonModule } from '@angular/common';
// import { ExpedienteModalComponent } from "./components/expediente-modal/expediente-modal.component";


// // Interface
// import { Expediente } from 'src/app/interfaces/components/expediente';

// // Izitoast
// import iziToast from 'izitoast';

// // Service
// import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
// import { AuthService } from 'src/app/services/auth.service';
// import { ExpedientesService } from 'src/app/pages/features/expedientes/services/expedientes.service';
// // import { GestionarParticipesComponent } from "./gestionar-participes/gestionar-participes.component";
// import { VerHistorialComponent } from "./components/ver-historial/ver-historial.component";
// import Swal from 'sweetalert2';
// import { VerExpedienteComponent } from "./components/ver-expediente/ver-expediente.component";
// import { DesignacionFormComponent } from "./components/designacion-form/designacion-form.component";

// @Component({
//   selector: 'app-expedientes',
//   imports: [DatePipe, ReactiveFormsModule, FormsModule, CommonModule, RouterOutlet, ExpedienteModalComponent, VerHistorialComponent, VerExpedienteComponent, DesignacionFormComponent],
//   templateUrl: './expedientes.component.html',
//   styles: ``
// })
// export class ExpedientesComponent {

//   // Expedientes
//   expedientes: any = [];
//   searchTimeout: any;

//   // =========================
//   // VARIABLES
//   // =========================
//   fb = inject(FormBuilder);
//   formUtils = FormUtils;

//   formExpediente!: FormGroup;
//   expedienteId: number | null = null;

//   loading = true;
//   mensajeError = '';
//   mensajeExito = '';
//   filtro: string = '';
//   modoEdicion = false;
//   mostrarModal = false;
//   mostrarModalParticipes = false;
//   mostrarModalFormDesignacion = false;
//   mostrarModalHistorial = false;
//   mostrarModalInfoExpediente = false;
//   selectedExpedienteId?: number;
//   expedienteSeleccionado: any | null = null;

//   menuAbierto: number | null = null;

//   rol: string = '';

//   menuActivo: any = null;
//   dropdownStyle: any = {};

//   // Control de error (opcional)
//   errorMessage: string = '';

//   // Search y filtros
//   search: string = '';
//   rolFiltro: string = '';

//   meses = [
//     { value: 1, label: 'Enero' },
//     { value: 2, label: 'Febrero' },
//     { value: 3, label: 'Marzo' },
//     { value: 4, label: 'Abril' },
//     { value: 5, label: 'Mayo' },
//     { value: 6, label: 'Junio' },
//     { value: 7, label: 'Julio' },
//     { value: 8, label: 'Agosto' },
//     { value: 9, label: 'Septiembre' },
//     { value: 10, label: 'Octubre' },
//     { value: 11, label: 'Noviembre' },
//     { value: 12, label: 'Diciembre' },
//   ];

//   anios: number[] = [];

//   filtroMes: number | '' = '';
//   filtroAnio: number | '' = '';
//   filtroSearch = '';

//   // Paginado
//   page = 1;
//   limit = 5;
//   totalItems = 0;
//   totalPages = 0;
//   currentPage = 1;

//   pageSizeOptions = [5, 10, 20, 50];

//   onPageSizeChange() {
//     this.currentPage = 1; // vuelve a la primera página
//   }

//   cambiarPagina(nuevaPagina: number) {
//     if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
//     this.page = nuevaPagina;
//     this.cargarExpedientes();
//   }

//   cambiarLimite() {
//     // this.limit = Number(this.limit);
//     this.page = 1;
//     this.cargarExpedientes();
//   }

//   toggleDropdown(event: MouseEvent, expediente: any) {
//     event.stopPropagation();

//     const button = event.currentTarget as HTMLElement;
//     const rect = button.getBoundingClientRect();

//     this.menuActivo = expediente;

//     this.dropdownStyle = {
//       top: `${rect.bottom + 8}px`,
//       left: `${rect.right - 200}px`, // ancho del menú
//     };
//   }

//   // Cerrar al hacer click fuera
//   @HostListener('document:click')
//   cerrarDropdown() {
//     this.menuActivo = null;
//   }

//   // Constructor
//   constructor(

//     private expedienteService: ExpedientesService,
//     private _authService: AuthService,
//     private router: Router,
//     private eRef: ElementRef) {

//     const usuario = _authService.getUser()

//     if (usuario) {
//       this.rol = usuario.rol;
//     }
//   }

//   // onInit
//   ngOnInit(): void {

//     const anioActual = new Date().getFullYear();
//     for (let i = anioActual; i >= anioActual - 5; i--) {
//       this.anios.push(i);
//     }

//     this.formExpediente = this.fb.group({
//       numero_expediente: ['', Validators.required],
//       anio: ['', Validators.required],
//       codigo: ['', Validators.required],
//       titulo: ['', Validators.required],
//       descripcion: [''],
//       tipo: ['', Validators.required],
//       estado: ['', Validators.required],
//       estado_procesal: ['', Validators.required],
//       fecha_inicio: ['', Validators.required],
//       fecha_laudo: [''],
//       fecha_resolucion: [''],
//       fecha_cierre: ['']
//     });


//     this.cargarExpedientes();
//   }

//   aplicarFiltros() {
//     this.page = 1; // reinicia paginación

//     this.cargarExpedientes(
//     );
//   }


//   abrirModal() {
//     this.modoEdicion = false;
//     this.expedienteSeleccionado = null;
//     this.mostrarModal = true;
//   }

//   cerrarModal() {
//     this.mostrarModal = false;
//     this.formExpediente.reset();
//   }

//   // Ejemplo de funciones base:
//   verDocumentos(exp: any) { this.router.navigate([`app/expedientes/${exp.id_expediente}/documentos`]); }

//   gestionarParticipesModal(exp: any) {
//     this.expedienteSeleccionado = exp;

//     console.log("Expediente seleccionado: ", exp);

//     this.mostrarModalParticipes = true;
//   }

//   designacionFormModal(exp: any) {
//     // this.expedienteId = exp.id_expediente;
//     this.expedienteSeleccionado = { ...exp };
//     this.mostrarModalFormDesignacion = true;
//   }

//   verHistorial(exp: any) {
//     this.expedienteId = exp.id_expediente;
//     this.mostrarModalHistorial = true;
//   }

//   verExpedienteInfo(exp: any) {
//     this.expedienteId = exp.id_expediente;
//     this.mostrarModalInfoExpediente = true;
//   }

//   editarExpediente(exp: Expediente): void {
//     this.modoEdicion = true;
//     this.expedienteSeleccionado = { ...exp };
//     this.mostrarModal = true;
//   }

//   cerrarModalFormDesignacion() {
//     this.mostrarModalFormDesignacion = false;
//     this.expedienteSeleccionado = null;
//     // this.expedienteId = null;
//   }

//   cerrarModalParticipes() {
//     this.mostrarModalParticipes = false;
//     this.expedienteSeleccionado = null;
//   }

//   cerrarModalHistorial() {
//     this.mostrarModalHistorial = false;
//     this.expedienteId = null;
//   }

//   eliminarExpediente(id_exp: number) {

//     Swal.fire({
//       title: '¿Eliminar expediente?',
//       text: 'Esta acción eliminará el expediente PERMANENTEMENTE y no podrá recuperarse.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Sí, eliminar',
//       cancelButtonText: 'Cancelar',
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6'
//     }).then((result) => {

//       if (result.isConfirmed) {

//         // Loader
//         Swal.fire({
//           title: 'Eliminando expediente...',
//           text: 'Por favor espera',
//           allowOutsideClick: false,
//           didOpen: () => {
//             Swal.showLoading();
//           }
//         });

//         this.expedienteService.deleteExpediente(id_exp).subscribe({
//           next: (resp) => {

//             Swal.fire({
//               icon: 'success',
//               title: 'Expediente eliminado',
//               text: 'El expediente fue eliminado correctamente',
//               timer: 2000,
//               showConfirmButton: false
//             });

//             // Recargar tabla
//             this.cargarExpedientes();
//           },
//           error: (err) => {

//             Swal.fire({
//               icon: 'error',
//               title: 'No se pudo eliminar',
//               text: err?.error?.message || 'Ocurrió un error al eliminar el expediente'
//             });

//             console.error(err);
//           }
//         });
//       }
//     });
//   }

//   cerrarModalInfo() {
//     this.mostrarModalInfoExpediente = false;
//     this.expedienteId = null;
//   }

//   onSearchChange() {
//     clearTimeout(this.searchTimeout);

//     this.searchTimeout = setTimeout(() => {
//       this.page = 1;
//       this.cargarExpedientes();
//     }, 200);
//   }


//   // =========================================================
//   // 1.- LOAD EXPDIENTES
//   // =========================================================
//   cargarExpedientes() {
//     this.loading = true;

//     this.expedienteService.getExpedientesPaginated({
//       page: this.page,
//       limit: this.limit,
//       nro_expediente: this.filtroSearch?.trim(),
//       mes: this.filtroMes || undefined,
//       anio: this.filtroAnio || undefined,

//     }).subscribe({
//       next: (resp) => {
//         this.expedientes = resp.data;
//         this.totalItems = resp.total;
//         this.totalPages = resp.totalPages;
//         this.currentPage = resp.page;
//         this.loading = false;
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMessage = 'Error al cargar los expedientes';
//       },
//     });
//   }

//   // =========================
//   // 6.- RESET FORMULARIO
//   // =========================
//   resetForm(): void {
//     this.formExpediente.reset();
//     // this.editMode = false;
//     this.mostrarModal = false;
//     this.selectedExpedienteId = undefined;
//   }


//   @HostListener('document:click', ['$event'])
//   onClickFuera(event: MouseEvent) {
//     const target = event.target as HTMLElement;
//     if (!target.closest('.dropdown')) {
//       this.cerrarDropdown();
//     }
//   }

//   anularExpediente(id_exp: number) {

//     console.log("id expediente: ", id_exp);

//     Swal.fire({
//       title: '¿Estás seguro?',
//       text: 'Esta acción anulará el expediente y no podrá revertirse fácilmente.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Sí, anular',
//       cancelButtonText: 'Cancelar',
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6'
//     }).then((result) => {

//       if (result.isConfirmed) {

//         // Loader mientras procesa
//         Swal.fire({
//           title: 'Anulando expediente...',
//           text: 'Por favor espera',
//           allowOutsideClick: false,
//           didOpen: () => {
//             Swal.showLoading();
//           }
//         });

//         this.expedienteService.anularExpediente(id_exp).subscribe({
//           next: (resp) => {

//             Swal.fire({
//               icon: 'success',
//               title: 'Expediente anulado',
//               text: 'El expediente fue anulado correctamente',
//               timer: 2000,
//               showConfirmButton: false
//             });


//             this.cargarExpedientes();

//           },
//           error: (err) => {

//             Swal.fire({
//               icon: 'error',
//               title: 'Error',
//               text: err?.error?.message || 'Ocurrió un error al anular el expediente'
//             });

//             console.error(err);
//           }
//         });
//       }
//     });
//   }

//   getEstadoClass(estado: string): string {
//     switch (estado) {
//       case 'En trámite':
//         return 'badge-info';

//       case 'En espera':
//         return 'badge-warning';

//       case 'Suspendido':
//         return 'badge-accent';

//       case 'Concluido':
//         return 'badge-success';

//       case 'Archivado':
//         return 'badge-neutral';

//       case 'Anulado':
//         return 'badge-error';

//       default:
//         return 'badge-ghost';
//     }
//   }


//   getEstadoProcesalClass(estado: string): string {
//     switch (estado) {
//       case 'Prearbitral':
//         return 'badge-primary';

//       case 'Instalación':
//         return 'badge-success';

//       case 'Audiencia':
//         return 'badge-accent';

//       case 'Concluido':
//         return 'badge-info';

//       case 'Plazo para laudar':
//         return 'badge-neutral';

//       default:
//         return 'badge-ghost';
//     }
//   }

//   abrirParticipe() {
//     throw new Error('Method not implemented.');
//   }

//   mapearTipoArbitraje(tipo: string):
//     'EMERGENCIA'
//     | 'AD_HOC'
//     | 'TRIBUNAL' {

//     switch (tipo) {

//       case 'Arbitraje de Emergencia':
//         return 'EMERGENCIA';

//       case 'Arbitraje Institucional':
//         return 'TRIBUNAL';

//       case 'Arbitraje Ad Hoc':
//       default:
//         return 'AD_HOC';
//     }
//   }
// }
