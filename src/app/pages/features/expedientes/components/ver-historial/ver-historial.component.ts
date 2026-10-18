import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';

// Services
import { ExpedientesService } from 'src/app/pages/features/expedientes/services/expedientes.service';

// Interfaces
import { ExpedienteEstado, ExpedienteHistorialFilters, ExpedienteHistorialItem, ExpedientesSortOrder } from 'src/app/pages/features/expedientes/interfaces';

// *********************************************************
// EVENTO PARA PRESENTACIÓN
// *********************************************************

interface HistorialEventoVista extends ExpedienteHistorialItem {
  detalleFormateado: string;
}

@Component({
  selector: 'ver-historial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './ver-historial.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerHistorialComponent implements OnChanges, OnDestroy {

  // *********************************************************
  // INPUTS / OUTPUTS
  // *********************************************************

  @Input() mostrarModal = false;
  @Input() expedienteId: number | null = null;

  @Output() modalCerrado = new EventEmitter<void>();

  // *********************************************************
  // ESTADO
  // *********************************************************

  timeline: HistorialEventoVista[] = [];

  loading = false;
  errorCarga: string | null = null;

  modalWidthClass = 'max-w-6xl';

  // *********************************************************
  // FILTROS
  // *********************************************************

  tipoEventoBusqueda = '';
  usuarioBusqueda: number | null = null;

  fechaDesdeBusqueda = '';
  fechaHastaBusqueda = '';

  ordenBusqueda: ExpedientesSortOrder = 'DESC';

  readonly tiposEventoDisponibles = [
    'CREACION',
    'ACTUALIZACION',
    'CAMBIO_ESTADO',
    'CAMBIO_ESTADO_PROCESAL',
    'ASIGNACION_RESPONSABLE',
    'REGISTRO_PARTICIPE',
    'REGISTRO_DOCUMENTO',
    'DESIGNACION',
    'CIERRE',
    'REAPERTURA',
    'ANULACION',
    'REGISTRO_MPV',
    'TRAMITE_MPV_APROBADO',
    'TRAMITE_MPV_RECHAZADO',
  ];

  // *********************************************************
  // PAGINACIÓN
  // *********************************************************

  page = 1;
  limit = 10;

  totalItems = 0;
  totalPages = 0;

  readonly pageSizeOptions = [5, 10, 20, 50];

  // *********************************************************
  // SUSCRIPCIÓN
  // *********************************************************

  private cargaSubscription?: Subscription;
  private destruido = false;

  constructor(
    private readonly expedienteService: ExpedientesService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  // *********************************************************
  // CICLO DE VIDA
  // *********************************************************

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mostrarModal) {
      this.cancelarCarga();
      this.limpiarDatos();
      return;
    }

    if (
      changes['expedienteId'] ||
      changes['mostrarModal']
    ) {
      this.resetearFiltros();
      this.cargarHistorial();
    }
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.cancelarCarga();
  }

  // *********************************************************
  // CARGAR HISTORIAL
  // *********************************************************

  cargarHistorial(): void {
    if (this.destruido) {
      return;
    }

    this.cancelarCarga();
    this.limpiarDatos();

    if (!this.mostrarModal) {
      return;
    }

    const id = this.expedienteId;

    if (
      id === null ||
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      this.mostrarError('Selecciona un expediente válido.');
      return;
    }

    const errorFiltros = this.validarFiltros();

    if (errorFiltros) {
      this.mostrarError(errorFiltros);
      return;
    }

    const filters: ExpedienteHistorialFilters = {
      page: this.page,
      limit: this.limit,

      tipo_evento:
        this.tipoEventoBusqueda.trim() || undefined,

      usuario_id:
        this.usuarioBusqueda ?? undefined,

      // Los límites incluyen el día seleccionado
      // utilizando el horario de Perú.
      fecha_desde: this.fechaDesdeBusqueda
        ? `${this.fechaDesdeBusqueda}T00:00:00.000-05:00`
        : undefined,

      fecha_hasta: this.fechaHastaBusqueda
        ? `${this.fechaHastaBusqueda}T23:59:59.999-05:00`
        : undefined,

      sort_by: 'fecha_accion',
      sort_order: this.ordenBusqueda,
    };

    this.loading = true;
    this.cdr.markForCheck();

    this.cargaSubscription = this.expedienteService
      .getExpedienteHistorial(id, filters)
      .pipe(
        finalize(() => {
          this.loading = false;

          if (!this.destruido) {
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.mostrarError(
              response.message ||
              'No se pudo obtener el historial del expediente.',
            );
            return;
          }

          const { items, paginacion } = response.data;

          this.timeline = items.map((evento) => ({
            ...evento,
            detalleFormateado: this.formatearDetalle(
              evento.detalle,
            ),
          }));

          this.page = paginacion.page;
          this.limit = paginacion.limit;
          this.totalItems = paginacion.total;
          this.totalPages = paginacion.totalPages;

          this.errorCarga = null;
          this.cdr.markForCheck();
        },

        error: (error: unknown) => {
          this.mostrarError(
            this.obtenerMensajeError(error),
          );
        },
      });
  }

  // *********************************************************
  // FILTROS
  // *********************************************************

  aplicarFiltros(): void {
    this.page = 1;
    this.cargarHistorial();
  }

  limpiarFiltros(): void {
    this.resetearFiltros();
    this.cargarHistorial();
  }

  private resetearFiltros(): void {
    this.tipoEventoBusqueda = '';
    this.usuarioBusqueda = null;

    this.fechaDesdeBusqueda = '';
    this.fechaHastaBusqueda = '';

    this.ordenBusqueda = 'DESC';
    this.page = 1;
  }

  private validarFiltros(): string | null {
    const evento = this.tipoEventoBusqueda.trim();

    if (
      evento &&
      (
        evento.length > 80 ||
        !/^[A-Z][A-Z0-9_]*$/.test(evento)
      )
    ) {
      return 'El tipo de evento debe ser un código en mayúsculas, de hasta 80 caracteres.';
    }

    if (
      this.usuarioBusqueda !== null &&
      (
        !Number.isSafeInteger(this.usuarioBusqueda) ||
        this.usuarioBusqueda <= 0 ||
        this.usuarioBusqueda > 2147483647
      )
    ) {
      return 'El ID del usuario debe ser un entero positivo válido.';
    }

    if (
      this.fechaDesdeBusqueda &&
      !this.esFechaValida(this.fechaDesdeBusqueda)
    ) {
      return 'La fecha inicial no es válida.';
    }

    if (
      this.fechaHastaBusqueda &&
      !this.esFechaValida(this.fechaHastaBusqueda)
    ) {
      return 'La fecha final no es válida.';
    }

    if (
      this.fechaDesdeBusqueda &&
      this.fechaHastaBusqueda &&
      this.fechaHastaBusqueda < this.fechaDesdeBusqueda
    ) {
      return 'La fecha final no puede ser anterior a la inicial.';
    }

    return null;
  }

  private esFechaValida(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const [anio, mes, dia] = value.split('-').map(Number);

    const fecha = new Date(0);
    fecha.setUTCHours(0, 0, 0, 0);
    fecha.setUTCFullYear(anio, mes - 1, dia);

    return (
      anio >= 1 &&
      fecha.getUTCFullYear() === anio &&
      fecha.getUTCMonth() === mes - 1 &&
      fecha.getUTCDate() === dia
    );
  }

  // *********************************************************
  // PAGINACIÓN
  // *********************************************************

  cambiarPagina(nuevaPagina: number): void {
    if (
      this.loading ||
      !Number.isInteger(nuevaPagina) ||
      nuevaPagina < 1 ||
      nuevaPagina > this.totalPages ||
      nuevaPagina === this.page
    ) {
      return;
    }

    this.page = nuevaPagina;
    this.cargarHistorial();
  }

  cambiarLimite(): void {
    const nuevoLimite = Number(this.limit);

    this.limit = this.pageSizeOptions.includes(nuevoLimite)
      ? nuevoLimite
      : this.pageSizeOptions[1];

    this.page = 1;
    this.cargarHistorial();
  }

  // *********************************************************
  // PRESENTACIÓN
  // *********************************************************

  getActor(evento: ExpedienteHistorialItem): string {
    return evento.usuario_responsable?.trim() ||
      evento.usuario?.correo ||
      (
        evento.usuario_id !== null
          ? `Usuario #${evento.usuario_id}`
          : 'Actor no registrado'
      );
  }

  getEstadoLabel(estado: ExpedienteEstado): string {
    const etiquetas: Record<ExpedienteEstado, string> = {
      EN_ESPERA: 'En espera',
      EN_TRAMITE: 'En trámite',
      SUSPENDIDO: 'Suspendido',
      CONCLUIDO: 'Concluido',
      ARCHIVADO: 'Archivado',
      ANULADO: 'Anulado',
    };

    return etiquetas[estado] ?? estado;
  }

  getTipoEventoLabel(tipo: string): string {
    return tipo.replace(/_/g, ' ');
  }

  getEventoClass(tipo: string): string {
    switch (tipo) {
      case 'CREACION':
      case 'REGISTRO_MPV':
        return 'badge-primary';

      case 'CIERRE':
      case 'TRAMITE_MPV_APROBADO':
        return 'badge-success';

      case 'ANULACION':
      case 'TRAMITE_MPV_RECHAZADO':
        return 'badge-error';

      case 'CAMBIO_ESTADO':
      case 'REAPERTURA':
        return 'badge-warning';

      default:
        return 'badge-info';
    }
  }

  // *********************************************************
  // DETALLES: TEXTO O JSON SERIALIZADO
  // Se transforma para mostrarlo como texto, nunca como HTML.
  // *********************************************************

  private formatearDetalle(detalle: string | null): string {
    if (!detalle?.trim()) {
      return '';
    }

    let datos: unknown;

    try {
      datos = JSON.parse(detalle);
    } catch {
      return detalle;
    }

    if (!this.esObjeto(datos)) {
      return detalle;
    }

    if (this.esObjeto(datos['cambios'])) {
      return Object.entries(datos['cambios'])
        .map(([campo, cambio]) => {
          if (!this.esObjeto(cambio)) {
            return `${this.etiquetaCampo(campo)}: ${this.valorTexto(cambio)}`;
          }

          return (
            `${this.etiquetaCampo(campo)}: ` +
            `${this.valorTexto(cambio['anterior'])} → ` +
            `${this.valorTexto(cambio['nuevo'])}`
          );
        })
        .join('\n');
    }

    return Object.entries(datos)
      .map(([campo, valor]) =>
        `${this.etiquetaCampo(campo)}: ${this.valorTexto(valor)}`,
      )
      .join('\n');
  }

  private etiquetaCampo(campo: string): string {
    const etiquetas: Record<string, string> = {
      titulo: 'Título',
      descripcion: 'Descripción',
      codigo: 'Código',
      tipo: 'Tipo',
      fecha_inicio: 'Fecha de inicio',
      fecha_laudo: 'Fecha de laudo',
      fecha_resolucion: 'Fecha de resolución',
      motivo: 'Motivo',
      usuario_responsable_anterior_id: 'Responsable anterior (ID)',
      usuario_responsable_nuevo_id: 'Nuevo responsable (ID)',
    };

    return etiquetas[campo] ?? campo.replace(/_/g, ' ');
  }

  private valorTexto(valor: unknown): string {
    if (valor === null || valor === undefined || valor === '') {
      return 'Sin valor';
    }

    if (typeof valor === 'object') {
      return JSON.stringify(valor);
    }

    return String(valor);
  }

  private esObjeto(
    value: unknown,
  ): value is Record<string, unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    );
  }

  // *********************************************************
  // ERRORES
  // *********************************************************

  private mostrarError(mensaje: string): void {
    this.timeline = [];
    this.totalItems = 0;
    this.totalPages = 0;
    this.errorCarga = mensaje;

    this.cdr.markForCheck();
  }

  private obtenerMensajeError(error: unknown): string {
    if (typeof error === 'string') {
      return error.trim() || 'No se pudo cargar el historial.';
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

    return 'No se pudo cargar el historial del expediente.';
  }

  // *********************************************************
  // MODAL
  // *********************************************************

  setModalWidth(
    size: 'sm' | 'md' | 'lg' | 'xl' | 'full',
  ): void {
    const clases = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full w-[95vw]',
    };

    this.modalWidthClass = clases[size];
    this.cdr.markForCheck();
  }

  cerrarModal(): void {
    this.cancelarCarga();
    this.limpiarDatos();

    // El padre controla mostrarModal.
    this.modalCerrado.emit();

    if (!this.destruido) {
      this.cdr.markForCheck();
    }
  }

  // *********************************************************
  // LIMPIEZA
  // *********************************************************

  private cancelarCarga(): void {
    this.cargaSubscription?.unsubscribe();
    this.cargaSubscription = undefined;
    this.loading = false;
  }

  private limpiarDatos(): void {
    this.timeline = [];
    this.totalItems = 0;
    this.totalPages = 0;
    this.errorCarga = null;
  }
}

// import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
// import { CommonModule, DatePipe } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';

// // Service
// import { ExpedientesService } from 'src/app/pages/features/expedientes/services/expedientes.service';

// @Component({
//   selector: 'ver-historial',
//   imports: [DatePipe, CommonModule],
//   templateUrl: './ver-historial.component.html',
//   styles: ``
// })
// export class VerHistorialComponent implements OnChanges {

//   @Input() mostrarModal = false;
//   @Input() expedienteId: number | null = null;

//   @Output() modalCerrado = new EventEmitter<void>();

//   historial: any;
//   timeline: any[] = [];    // historial / eventos
//   loading = true;

//   // Ancho de modal
//   modalWidthClass = 'max-w-4xl'; // default

//   setModalWidth(size: 'sm' | 'md' | 'lg' | 'xl' | 'full') {
//     const map = {
//       sm: 'max-w-md',
//       md: 'max-w-xl',
//       lg: 'max-w-4xl',
//       xl: 'max-w-6xl',
//       full: 'max-w-full w-[95vw]'
//     };

//     this.modalWidthClass = map[size];
//   }

//   constructor(
//     private expedienteService: ExpedientesService,
//   ) { }


//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['expedienteId'] && this.expedienteId) {
//       this.cargarHistorial();
//       this.setModalWidth('full');
//     }
//   }
//   // ngOnInit(): void {
//   //   this.idExpediente = Number(this.route.snapshot.paramMap.get('id'));
//   //   this.cargarHistorial();
//   // }

//   cargarHistorial() {
//     this.loading = true;

//     this.expedienteService.obtenerTrazabilidad(this.expedienteId!).subscribe({
//       next: (data) => {
//         this.historial = data;
//         this.timeline = data.timeline || [];
//         this.loading = false;
//       },
//       error: (err) => {

//         this.loading = false;
//       },
//     });
//   }

//   //  Cerrar el modal
//   cerrarModal(): void {
//     this.mostrarModal = false;
//     this.modalCerrado.emit();

//   }

//   // volver() {
//   //   this.router.navigate(['/app/expedientes']);
//   // }
// }
