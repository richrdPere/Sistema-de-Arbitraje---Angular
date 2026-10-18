import { CommonModule } from '@angular/common';
import {  ChangeDetectorRef,  Component,  HostListener,  OnDestroy,  OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  Observable,  Subject,  Subscription,  debounceTime,  finalize,  firstValueFrom,  of,  switchMap,  takeUntil} from 'rxjs';
import Swal from 'sweetalert2';

// Services
import {  SolicitudesRefreshService} from 'src/app/core/services/solicitudesRefresh.service';

// Interfaces
import {
  GetTramitesPaginatedFilters,
  MesaPartesEstadoTramite,
  MesaPartesSolicitanteListado,
  MesaPartesTipoSolicitud,
  MesaPartesTramiteListado,
} from 'src/app/pages/features/solicitudes/interfaces';

// Componentes existentes
import {
  SolicitudDetailComponent,
} from './components/solicitud-detail/solicitud-detail.component';

import {
  SolicitudAprobadoComponent,
} from './components/solicitud-aprobado/solicitud-aprobado.component';

import {
  SolicitudDocsComponent,
} from './components/solicitud-docs/solicitud-docs.component';

import {
  ListAprobadosComponent,
} from './components/list-aprobados/list-aprobados.component';

import {
  ListRechazadosComponent,
} from './components/list-rechazados/list-rechazados.component';
import { MesaPartesService } from './services/mesa-partes.service';

// *********************************************************
// TIPOS INTERNOS
// *********************************************************

type SolicitudesTab = 'pendiente' | 'aprobado' | 'rechazado';

type AccionTramite = 'APROBAR' | 'RECHAZAR';

interface ResultadoOperacion {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    SolicitudDetailComponent,
    // SolicitudAprobadoComponent,
    // SolicitudDocsComponent,
    // ListAprobadosComponent,
    // ListRechazadosComponent,
  ],
  templateUrl: './solicitudes.component.html',
})
export class SolicitudesComponent implements OnInit, OnDestroy {

  // *********************************************************
  // LISTADO
  // *********************************************************

  solicitudes: MesaPartesTramiteListado[] = [];

  isLoading = false;
  errorMessage = '';

  // Compatibilidad con el HTML anterior.
  get loading(): boolean {
    return this.isLoading;
  }

  get solicitudesFiltradas(): MesaPartesTramiteListado[] {
    return this.solicitudes;
  }

  // *********************************************************
  // FILTROS
  // *********************************************************

  filtroSearch = '';
  filtroTipo: MesaPartesTipoSolicitud | '' = '';

  fecha_inicio = '';
  fecha_fin = '';

  searchTimeout: ReturnType<typeof setTimeout> | undefined;

  readonly tiposTramite: {
    value: MesaPartesTipoSolicitud;
    label: string;
  }[] = [
      {
        value: 'ARBITRAJE_AD_HOC',
        label: 'Arbitraje ad hoc',
      },
      {
        value: 'ARBITRAJE_INSTITUCIONAL',
        label: 'Arbitraje institucional',
      },
      {
        value: 'ARBITRAJE_DE_EMERGENCIA',
        label: 'Arbitraje de emergencia',
      },
    ];

  // *********************************************************
  // PESTAÑAS
  // *********************************************************

  tabActivo: SolicitudesTab = 'pendiente';

  get estadoActual(): MesaPartesEstadoTramite {
    switch (this.tabActivo) {
      case 'aprobado':
        return 'APROBADA';

      case 'rechazado':
        return 'RECHAZADA';

      default:
        return 'PENDIENTE';
    }
  }

  // *********************************************************
  // PAGINACIÓN
  // *********************************************************

  page = 1;
  limit = 5;

  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  hasPreviousPage = false;
  hasNextPage = false;

  readonly pageSizeOptions = [5, 10, 20, 50];

  // *********************************************************
  // MODALES
  // *********************************************************

  // Modal de revisión/aprobación.
  tipoModal: 'estado' | null = null;

  tramiteSeleccionado: MesaPartesTramiteListado | null = null;

  // Modal de detalle.
  mostrarDetalle = false;

  tramiteDetalle: MesaPartesTramiteListado | null = null;

  // Modal de documentos.
  mostrarModal = false;

  tramiteArchivosSeleccionado: MesaPartesTramiteListado | null = null;

  // *********************************************************
  // MENÚ
  // *********************************************************

  menuAbierto: number | null = null;

  // *********************************************************
  // OPERACIONES EN CURSO
  // *********************************************************

  readonly tramitesEnOperacion = new Set<number>();

  // *********************************************************
  // SUSCRIPCIONES
  // *********************************************************

  private listadoSubscription?: Subscription;
  private readonly destruir$ = new Subject<void>();

  private destruido = false;

  constructor(
    private readonly mesaPartesService: MesaPartesService,
    private readonly refreshService: SolicitudesRefreshService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  // *********************************************************
  // CICLO DE VIDA
  // *********************************************************

  ngOnInit(): void {
    this.refreshService.refresh$
      .pipe(
        debounceTime(50),
        takeUntil(this.destruir$),
      )
      .subscribe(() => {
        this.cargarTramitesPorEstado();
      });

    this.cargarTramitesPorEstado();
  }

  ngOnDestroy(): void {
    this.destruido = true;

    clearTimeout(this.searchTimeout);

    this.destruir$.next();
    this.destruir$.complete();
  }

  // *********************************************************
  // 1. CARGAR TRÁMITES
  // *********************************************************

  cargarTramitesPorEstado(
    estado?: MesaPartesEstadoTramite,
  ): void {
    this.listadoSubscription?.unsubscribe();

    if (estado) {
      this.sincronizarTab(estado);
    }

    this.errorMessage = '';

    const errorFechas = this.validarFechas();

    if (errorFechas) {
      this.limpiarListado();
      this.errorMessage = errorFechas;
      this.cdr.markForCheck();
      return;
    }

    const filtros: GetTramitesPaginatedFilters = {
      page: this.page,
      limit: this.limit,

      search: this.filtroSearch.trim() || undefined,

      tipo_solicitud: this.filtroTipo || undefined,
      estado: this.estadoActual,

      fecha_inicio: this.fecha_inicio || undefined,
      fecha_fin: this.fecha_fin || undefined,

      sort_by: 'createdAt',
      sort_order: 'DESC',
    };

    this.isLoading = true;

    this.listadoSubscription = this.mesaPartesService
      .getTramitesPaginated(filtros)
      .pipe(
        // Si al procesar una solicitud desaparece la última
        // página, consulta nuevamente la última página válida.
        switchMap((response) => {
          if (
            response.success &&
            response.data &&
            response.data.pagination.totalPages > 0 &&
            this.page > response.data.pagination.totalPages
          ) {
            const ultimaPagina =
              response.data.pagination.totalPages;

            return this.mesaPartesService
              .getTramitesPaginated({
                ...filtros,
                page: ultimaPagina,
              });
          }

          return of(response);
        }),

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
              'No se pudieron obtener los trámites.';

            return;
          }

          const { items, pagination } = response.data;

          this.solicitudes = items;

          this.totalItems = pagination.total;
          this.totalPages = pagination.totalPages;

          this.page = pagination.totalPages === 0
            ? 1
            : pagination.page;

          this.currentPage = this.page;
          this.limit = pagination.limit;

          this.hasPreviousPage = pagination.hasPreviousPage;
          this.hasNextPage = pagination.hasNextPage;
        },

        error: (error: unknown) => {
          this.limpiarListado();

          this.errorMessage = this.obtenerMensajeError(
            error,
            'No se pudieron obtener los trámites.',
          );
        },
      });
  }

  // *********************************************************
  // 2. PESTAÑAS
  // *********************************************************

  cambiarTab(tab: SolicitudesTab): void {
    if (tab === this.tabActivo) {
      return;
    }

    clearTimeout(this.searchTimeout);

    this.tabActivo = tab;
    this.reiniciarPagina();
    this.cerrarDropdown();

    this.cargarTramitesPorEstado();
  }

  private sincronizarTab(
    estado: MesaPartesEstadoTramite,
  ): void {
    switch (estado) {
      case 'APROBADA':
        this.tabActivo = 'aprobado';
        break;

      case 'RECHAZADA':
        this.tabActivo = 'rechazado';
        break;

      default:
        this.tabActivo = 'pendiente';
    }
  }

  // *********************************************************
  // 3. FILTROS
  // Se aplican en el backend antes de paginar.
  // *********************************************************

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.reiniciarPagina();
      this.cerrarDropdown();
      this.cargarTramitesPorEstado();
    }, 300);
  }

  aplicarFiltros(): void {
    clearTimeout(this.searchTimeout);

    this.reiniciarPagina();
    this.cerrarDropdown();
    this.cargarTramitesPorEstado();
  }

  onFiltroChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    clearTimeout(this.searchTimeout);

    this.filtroSearch = '';
    this.filtroTipo = '';

    this.fecha_inicio = '';
    this.fecha_fin = '';

    this.reiniciarPagina();
    this.cargarTramitesPorEstado();
  }

  private validarFechas(): string | null {
    if (
      this.fecha_inicio &&
      !this.esFechaValida(this.fecha_inicio)
    ) {
      return 'Selecciona una fecha inicial válida.';
    }

    if (
      this.fecha_fin &&
      !this.esFechaValida(this.fecha_fin)
    ) {
      return 'Selecciona una fecha final válida.';
    }

    if (
      this.fecha_inicio &&
      this.fecha_fin &&
      this.fecha_fin < this.fecha_inicio
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
  // 4. PAGINACIÓN
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
    this.cargarTramitesPorEstado();
  }

  cambiarLimite(): void {
    clearTimeout(this.searchTimeout);

    const nuevoLimite = Number(this.limit);

    this.limit = this.pageSizeOptions.includes(nuevoLimite)
      ? nuevoLimite
      : this.pageSizeOptions[0];

    this.reiniciarPagina();
    this.cargarTramitesPorEstado();
  }

  onPageSizeChange(): void {
    this.cambiarLimite();
  }

  private reiniciarPagina(): void {
    this.page = 1;
    this.currentPage = 1;
  }

  // *********************************************************
  // 5. APROBAR / RECHAZAR
  // Pueden ejecutarse con una fila o con el trámite seleccionado.
  // *********************************************************

  aprobarSolicitud(
    tramite: MesaPartesTramiteListado | null =
      this.tramiteSeleccionado,
  ): Promise<void> {
    return this.procesarTramite(
      tramite,
      'APROBAR',
    );
  }

  rechazarSolicitud(
    motivo = '',
    tramite: MesaPartesTramiteListado | null =
      this.tramiteSeleccionado,
  ): Promise<void> {
    return this.procesarTramite(
      tramite,
      'RECHAZAR',
      motivo,
    );
  }

  private async procesarTramite(
    tramite: MesaPartesTramiteListado | null,
    accion: AccionTramite,
    motivoInicial = '',
  ): Promise<void> {
    if (
      !tramite ||
      !this.puedeRevisar(tramite) ||
      this.estaEnOperacion(tramite.id_tramite)
    ) {
      return;
    }

    const idTramite = tramite.id_tramite;
    const esRechazo = accion === 'RECHAZAR';

    this.cerrarDropdown();
    this.tramitesEnOperacion.add(idTramite);
    this.cdr.markForCheck();

    try {
      const resultado = await Swal.fire({
        icon: 'warning',

        title: esRechazo
          ? '¿Rechazar trámite?'
          : '¿Aprobar trámite?',

        text: `Trámite ${tramite.numero_tramite}`,

        input: 'textarea',

        inputLabel: esRechazo
          ? 'Motivo del rechazo'
          : 'Observaciones (opcional)',

        inputPlaceholder: esRechazo
          ? 'Describe el motivo del rechazo.'
          : 'Ingresa las observaciones de la revisión.',

        inputValue: motivoInicial,
        inputAutoTrim: true,

        showCancelButton: true,

        confirmButtonText: esRechazo
          ? 'Sí, rechazar'
          : 'Sí, aprobar',

        cancelButtonText: 'Cancelar',

        confirmButtonColor: esRechazo
          ? '#dc2626'
          : '#16a34a',

        reverseButtons: true,
        focusCancel: true,
        showLoaderOnConfirm: true,

        allowOutsideClick: () => !Swal.isLoading(),
        allowEscapeKey: () => !Swal.isLoading(),

        preConfirm: async (valor: string) => {
          if (this.destruido) {
            return false;
          }

          const observaciones = valor?.trim() || '';

          if (esRechazo && !observaciones) {
            Swal.showValidationMessage(
              'El motivo del rechazo es obligatorio.',
            );

            return false;
          }

          try {
            const solicitud$: Observable<ResultadoOperacion> =
              esRechazo
                ? this.mesaPartesService.rechazarTramite(
                  idTramite,
                  { observaciones },
                )
                : this.mesaPartesService.aprobarTramite(
                  idTramite,
                  observaciones
                    ? { observaciones }
                    : {},
                );

            const response = await firstValueFrom(
              solicitud$.pipe(
                takeUntil(this.destruir$),
              ),
            );

            if (!response.success) {
              Swal.showValidationMessage(
                response.message ||
                'No se pudo procesar el trámite.',
              );

              return false;
            }

            return response;
          } catch (error: unknown) {
            if (!this.destruido) {
              Swal.showValidationMessage(
                this.obtenerMensajeError(
                  error,
                  'No se pudo procesar el trámite.',
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

      this.tramitesEnOperacion.delete(idTramite);

      if (
        this.tramiteSeleccionado?.id_tramite === idTramite
      ) {
        this.cerrarModal();
      }

      // El padre escucha refresh$, por lo que no es necesario
      // llamar también a cargarTramitesPorEstado aquí.
      this.refreshService.emitirActualizacion();

      void Swal.fire({
        icon: 'success',

        title: esRechazo
          ? 'Solicitud rechazada'
          : 'Solicitud aprobada',

        text: resultado.value.message,
        confirmButtonText: 'Aceptar',
      });
    } catch (error: unknown) {
      if (!this.destruido) {
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo completar la operación',

          text: this.obtenerMensajeError(
            error,
            'No se pudo procesar el trámite.',
          ),
        });
      }
    } finally {
      this.tramitesEnOperacion.delete(idTramite);

      if (!this.destruido) {
        this.cdr.markForCheck();
      }
    }
  }

  puedeRevisar(tramite: MesaPartesTramiteListado): boolean {
    return tramite.estado === 'PENDIENTE';
  }

  estaEnOperacion(idTramite: number): boolean {
    return this.tramitesEnOperacion.has(idTramite);
  }

  // *********************************************************
  // 6. MODAL DE REVISIÓN
  // *********************************************************

  abrirModalEstado(
    tramite: MesaPartesTramiteListado,
  ): void {
    if (
      !this.puedeRevisar(tramite) ||
      this.estaEnOperacion(tramite.id_tramite)
    ) {
      return;
    }

    this.cerrarDropdown();

    this.tramiteSeleccionado = tramite;
    this.tipoModal = 'estado';
  }

  abrirModal(tramite: MesaPartesTramiteListado): void {
    this.abrirModalEstado(tramite);
  }

  cerrarModal(): void {
    if (
      this.tramiteSeleccionado &&
      this.estaEnOperacion(
        this.tramiteSeleccionado.id_tramite,
      )
    ) {
      return;
    }

    this.tipoModal = null;
    this.tramiteSeleccionado = null;
  }

  // *********************************************************
  // 7. MODAL DE DETALLE
  // *********************************************************

  verDetalle(tramite: MesaPartesTramiteListado): void {
    this.cerrarDropdown();

    this.tramiteDetalle = tramite;
    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.tramiteDetalle = null;
  }

  // *********************************************************
  // 8. MODAL DE DOCUMENTOS
  //
  // El listado no incluye documentos.
  // El subcomponente deberá consultar el detalle por ID.
  // *********************************************************

  verArchivos(tramite: MesaPartesTramiteListado): void {
    this.cerrarDropdown();

    this.tramiteArchivosSeleccionado = tramite;
    this.mostrarModal = true;
  }

  cerrarArchivos(): void {
    this.mostrarModal = false;
    this.tramiteArchivosSeleccionado = null;
  }

  // *********************************************************
  // 9. MENÚ
  // Utilizar id_tramite en lugar del índice de la fila.
  // *********************************************************

  toggleDropdown(
    idTramite: number,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    this.menuAbierto = this.menuAbierto === idTramite
      ? null
      : idTramite;
  }

  @HostListener('document:click')
  cerrarDropdown(): void {
    this.menuAbierto = null;
  }

  // *********************************************************
  // PRESENTACIÓN
  // *********************************************************

  getNombreSolicitante(
    persona: MesaPartesSolicitanteListado | null,
  ): string {
    if (!persona) {
      return 'No registrado';
    }

    switch (persona.tipo) {
      case 'NATURAL':
        return [
          persona.nombres?.trim(),
          persona.apellidos?.trim(),
        ]
          .filter(Boolean)
          .join(' ') || 'No registrado';

      case 'JURIDICA':
        return persona.razon_social?.trim() ||
          'No registrado';

      case 'ENTIDAD_PUBLICA':
        return persona.nombre_entidad?.trim() ||
          'No registrado';

      default:
        return 'No registrado';
    }
  }

  getDocumentoSolicitante(
    persona: MesaPartesSolicitanteListado | null,
  ): string {
    if (!persona) {
      return 'No registrado';
    }

    return (
      persona.tipo === 'NATURAL'
        ? persona.dni
        : persona.ruc
    ) || 'No registrado';
  }

  getTipoLabel(tipo: MesaPartesTipoSolicitud): string {
    return this.tiposTramite.find(
      (opcion) => opcion.value === tipo,
    )?.label ?? tipo;
  }

  getEstadoLabel(estado: MesaPartesEstadoTramite): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente';

      case 'APROBADA':
        return 'Aprobada';

      case 'RECHAZADA':
        return 'Rechazada';

      default:
        return estado;
    }
  }

  getEstadoClass(estado: MesaPartesEstadoTramite): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'badge-warning';

      case 'APROBADA':
        return 'badge-success';

      case 'RECHAZADA':
        return 'badge-error';

      default:
        return 'badge-neutral';
    }
  }

  // *********************************************************
  // LIMPIEZA
  // *********************************************************

  private limpiarListado(): void {
    this.solicitudes = [];

    this.totalItems = 0;
    this.totalPages = 0;

    this.hasPreviousPage = false;
    this.hasNextPage = false;
  }

  // *********************************************************
  // ERRORES
  // *********************************************************

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

// import { Component, OnInit, inject } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { FormUtils } from 'src/app/utils/form-utils';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';

// import Swal from 'sweetalert2';

// // Service
// import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
// import { AuthService } from 'src/app/services/auth.service';

// // Pipes
// import { DatePipe } from '@angular/common';
// import { SolicitudDetailComponent } from "./components/solicitud-detail/solicitud-detail.component";
// import { SolicitudAprobadoComponent } from "./components/solicitud-aprobado/solicitud-aprobado.component";
// import { SolicitudDocsComponent } from "./components/solicitud-docs/solicitud-docs.component";
// import { Router } from '@angular/router';
// import { ListAprobadosComponent } from "./components/list-aprobados/list-aprobados.component";
// import { ListRechazadosComponent } from "./components/list-rechazados/list-rechazados.component";
// import { SolicitudesRefreshService } from 'src/app/core/services/solicitudesRefresh.service';


// @Component({
//   selector: 'app-solicitudes',
//   imports: [CommonModule, ReactiveFormsModule, FormsModule, SolicitudDetailComponent, SolicitudAprobadoComponent, SolicitudDocsComponent, ListAprobadosComponent, ListRechazadosComponent],
//   templateUrl: './solicitudes.component.html',
//   styles: ``
// })
// export class SolicitudesComponent implements OnInit {

//   // Variables
//   fb = inject(FormBuilder);
//   formUtils = FormUtils;

//   solicitudes: any[] = [];
//   solicitudesFiltradas: any[] = [];

//   // Nuevo campo para razón o comentario
//   razonRechazo: string = '';

//   loading = false;

//   usuario: any = null;
//   rol: string = '';

//   mostrarModal = false;
//   mostrarDetalle = false;
//   tramiteSeleccionado: any = null;
//   tramiteDetalle: any = null;

//   documentosSeleccionados: any[] = [];

//   // Filtros
//   search = '';
//   estado = 'pendiente';
//   tipo = '';
//   fecha_inicio = '';
//   fecha_fin = '';
//   filtroSearch: string = '';
//   filtroTipo: string = '';
//   // filtroEstado: string = '';

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
//     this.cargarTramitesPorEstado();
//   }

//   cambiarLimite() {
//     this.limit = Number(this.limit);
//     this.page = 1;
//     this.cargarTramitesPorEstado();
//   }

//   tabActivo: 'pendiente' | 'aprobado' | 'rechazado' = 'pendiente';

//   // lista de tipos (si no la tienes)
//   tiposTramite: string[] = ['Arbitraje Ad Hoc', 'Arbitraje Institucional', 'Arbitraje de Emergencia'];

//   // Dropdown
//   menuAbierto: number | null = null;

//   menuPosX = 0;
//   menuPosY = 0;

//   toggleDropdown(index: number, event: MouseEvent) {
//     // Si se vuelve a hacer click en el mismo menú, se cierra
//     event.stopPropagation(); // Evita que se cierre inmediatamente
//     this.menuAbierto = this.menuAbierto === index ? null : index;
//   }

//   cerrarDropdown() {
//     this.menuAbierto = null;
//   }

//   // MODAL
//   modalVisible = false;
//   nuevoEstado: string = '';
//   tipoModal: 'detalle' | 'estado' | null = null;

//   constructor(
//     private router: Router,
//     private tramiteService: TramiteMPVService,
//     private refreshService: SolicitudesRefreshService,
//     private authService: AuthService
//   ) {

//     this.usuario = authService.getUser()

//     if (this.usuario) {
//       this.rol = this.usuario.rol;
//     }
//   }


//   ngOnInit(): void {
//     this.cargarTramitesPorEstado();
//   }


//   // ======================================================
//   // METHODS
//   // ======================================================

//   // - Cargar trámites
//   cargarTramitesPorEstado(estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'): void {
//     this.loading = true;

//     const filtros: any = {
//       page: this.page,
//       limit: this.limit,
//       search: this.filtroSearch,
//       tipo: this.filtroTipo,
//       estado: "PENDIENTE",
//     };

//     // Si es usuario, debe enviarse el ID
//     if (this.rol === 'usuario') {
//       filtros.id_usuario = this.usuario.id;
//     }

//     this.tramiteService.listarTramitesPaginated(filtros).subscribe({
//       next: (resp) => {
//         this.solicitudes = resp.data ?? [];

//         this.solicitudesFiltradas = [...this.solicitudes];

//         this.totalItems = resp.total;
//         this.totalPages = resp.totalPages;


//         // AJUSTE AUTOMÁTICO DE PÁGINA
//         if (this.page > this.totalPages && this.totalPages > 0) {
//           this.page = this.totalPages;
//           this.cargarTramitesPorEstado(estado); //  recargar con página válida
//           return;
//         }

//         this.loading = false;
//       },
//       error: (err) => {
//         this.loading = false;
//       },
//     });
//   }

//   // - Aplicar filtros
//   aplicarFiltros() {
//     const buscar = (this.filtroSearch || '').toLowerCase().trim();
//     const tipo = this.filtroTipo;
//     // const estado = this.filtroEstado;

//     this.solicitudesFiltradas = this.solicitudes.filter(item => {

//       const matchTexto =
//         !buscar ||
//         (item.numero_expediente || '').toLowerCase().includes(buscar) ||
//         (item.solicitante || '').toLowerCase().includes(buscar) ||
//         (item.correo || '').toLowerCase().includes(buscar) ||
//         (item.tipo || '').toLowerCase().includes(buscar);

//       const matchTipo =
//         !tipo || item.tipo === tipo;

//       return matchTexto && matchTipo;
//     });
//   }

//   // - Aprobar solicitud
//   aprobarSolicitud() {
//     this.nuevoEstado = 'APROBADA';
//     this.confirmarCambioEstado();
//   }

//   // - Rechazar solicitud
//   rechazarSolicitud(motivo: string) {
//     this.nuevoEstado = 'RECHAZADA';
//     this.razonRechazo = motivo;
//     this.confirmarCambioEstado();
//   }

//   // - Cambiar estado del trámite
//   confirmarCambioEstado() {
//     if (!this.tramiteSeleccionado || !this.nuevoEstado) return;

//     const tramite = this.tramiteSeleccionado;

//     // 1. Preparamos payload
//     const payload: any = {
//       estado: this.nuevoEstado,
//       usuario_id: this.usuario.id,
//       observaciones: this.nuevoEstado === 'RECHAZADA' ? this.razonRechazo : null,
//       correo_solicitante: tramite.correo,
//       nombre_solicitante: tramite.solicitante,
//     };

//     // 2. Loading inicial
//     Swal.fire({
//       title: 'Procesando...',
//       text: 'Actualizando estado del trámite',
//       allowOutsideClick: false,
//       didOpen: () => Swal.showLoading(),
//     });

//     // 3. Actualizamos TRÁMITE
//     this.tramiteService.updateEstadoTramite(tramite.id, payload)
//       .subscribe({
//         next: () => {

//           Swal.fire({
//             icon: 'success',
//             title:
//               this.nuevoEstado === 'APROBADA'
//                 ? 'Solicitud aprobada'
//                 : 'Solicitud rechazada',
//             html:
//               this.nuevoEstado === 'RECHAZADA'
//                 ? `<b>Motivo:</b><br>${this.razonRechazo}`
//                 : 'Se ha procesado correctamente.',
//           });

//           this.cerrarModal();
//           this.razonRechazo = '';

//           this.cargarTramitesPorEstado();
//           this.refreshService.emitirActualizacion();
//         },

//         error: (err) => {

//           Swal.fire({
//             icon: 'error',
//             title: 'Error al actualizar trámite',
//             text: 'No se pudo actualizar el trámite. Intente nuevamente.',
//           });
//         }
//       });
//   }

//   // ======================================================
//   // HELPERS METHODS
//   // ======================================================

//   // - Modal estado
//   abrirModalEstado(tramite: any) {
//     this.tramiteSeleccionado = tramite;
//     this.tipoModal = 'estado';
//   }

//   abrirModal(solicitud: any) {
//     this.tramiteSeleccionado = solicitud;
//     this.tipoModal = 'estado';
//   }

//   cerrarModal() {
//     this.tipoModal = null;
//     this.mostrarModal = false;

//     this.tramiteSeleccionado = null;
//     this.tramiteDetalle = null;

//   }

//   // - Modal detalle
//   verDetalle(tramite: any) {
//     this.tramiteDetalle = tramite;
//     this.mostrarDetalle = true;
//   }

//   cerrarDetalle() {
//     this.mostrarDetalle = false;
//     this.tramiteSeleccionado = null;
//   }

//   // - Modal ver archivo
//   verArchivos(item: any) {
//     this.mostrarModal = true;
//     this.documentosSeleccionados = item.documentos;
//   }
// }
