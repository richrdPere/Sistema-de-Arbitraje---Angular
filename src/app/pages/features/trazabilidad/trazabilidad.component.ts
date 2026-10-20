import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Subscription,
  catchError,
  finalize,
  from,
  map,
  mergeMap,
  of,
} from 'rxjs';

// Services
import {
  ExpedientesService,
} from 'src/app/pages/features/expedientes/services/expedientes.service';

// Interfaces
import {
  ExpedienteEstado,
  ExpedienteEstadoProcesal,
  ExpedientePaginadoItem,
  ExpedientesPaginadosFilters,
  ExpedienteTrazabilidadResumen,
} from 'src/app/pages/features/expedientes/interfaces';

// Componentes
import {
  VerTrazabilidadComponent,
} from './components/ver-trazabilidad/ver-trazabilidad.component';

// *********************************************************
// EXPEDIENTE PARA PRESENTACIÓN
// *********************************************************

export interface ExpedienteTrazabilidadListado
  extends ExpedientePaginadoItem {
  resumenTrazabilidad: ExpedienteTrazabilidadResumen | null;

  ultimoMovimiento: string;
  detalleUltimoMovimiento: string | null;
  fechaUltimoMovimiento: string | null;

  loadingResumen: boolean;
  errorResumen: string | null;
}

@Component({
  selector: 'app-trazabilidad',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VerTrazabilidadComponent,
  ],
  templateUrl: './trazabilidad.component.html',
})
export class TrazabilidadComponent implements OnInit, OnDestroy {

  // *********************************************************
  // LISTADO
  // *********************************************************

  expedientes: ExpedienteTrazabilidadListado[] = [];

  isLoading = false;
  errorMessage = '';

  // Compatibilidad con el HTML anterior.
  get loading(): boolean {
    return this.isLoading;
  }

  // *********************************************************
  // MODAL
  // *********************************************************

  mostrarModal = false;
  expedienteId: number | null = null;

  // *********************************************************
  // FILTROS
  // *********************************************************

  filtroEstado: ExpedienteEstado | '' = '';
  filtroEstadoProcesal: ExpedienteEstadoProcesal | '' = '';
  filtroSearch = '';

  searchTimeout: ReturnType<typeof setTimeout> | undefined;

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
  // SUSCRIPCIONES
  // *********************************************************

  private listadoSubscription?: Subscription;
  private resumenSubscription?: Subscription;

  private destruido = false;

  constructor(
    private readonly expedientesService: ExpedientesService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  // *********************************************************
  // CICLO DE VIDA
  // *********************************************************

  ngOnInit(): void {
    this.listarExpedientes();
  }

  ngOnDestroy(): void {
    this.destruido = true;

    clearTimeout(this.searchTimeout);
    this.cancelarConsultas();
  }

  // *********************************************************
  // 1. LISTAR EXPEDIENTES
  // *********************************************************

  listarExpedientes(): void {
    this.cancelarConsultas();

    this.errorMessage = '';
    this.isLoading = true;

    const filters: ExpedientesPaginadosFilters = {
      page: this.page,
      limit: this.limit,

      search: this.filtroSearch.trim() || undefined,
      estado: this.filtroEstado || undefined,

      estado_procesal:
        this.filtroEstadoProcesal || undefined,

      sort_by: 'createdAt',
      sort_order: 'DESC',
    };

    this.listadoSubscription = this.expedientesService
      .getExpedientesPaginados(filters)
      .pipe(
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

          this.expedientes = items.map((expediente) => ({
            ...expediente,

            resumenTrazabilidad: null,

            ultimoMovimiento: '—',
            detalleUltimoMovimiento: null,
            fechaUltimoMovimiento: null,

            loadingResumen: true,
            errorResumen: null,
          }));

          this.totalItems = paginacion.total;
          this.totalPages = paginacion.totalPages;

          this.page = paginacion.page;
          this.currentPage = paginacion.page;
          this.limit = paginacion.limit;

          this.cargarResumenes();
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

  // *********************************************************
  // 2. CARGAR RESÚMENES DE TRAZABILIDAD
  //
  // Se procesan hasta tres solicitudes simultáneas.
  // Cambiar de página o filtros cancela las anteriores.
  // Un error individual no interrumpe las demás filas.
  // *********************************************************

  private cargarResumenes(): void {
    this.resumenSubscription?.unsubscribe();

    this.resumenSubscription = from(this.expedientes)
      .pipe(
        mergeMap(
          (expediente) =>
            this.expedientesService
              .getExpedienteTrazabilidad(
                expediente.id_expediente,
              )
              .pipe(
                map((response): ExpedienteTrazabilidadListado => {
                  if (!response.success || !response.data) {
                    return {
                      ...expediente,
                      loadingResumen: false,
                      errorResumen:
                        response.message ||
                        'No se pudo cargar el resumen.',
                    };
                  }

                  const { resumen, ultimo_movimiento } =
                    response.data;

                  return {
                    ...expediente,

                    resumenTrazabilidad: resumen,

                    ultimoMovimiento:
                      ultimo_movimiento?.accion || '—',

                    detalleUltimoMovimiento:
                      ultimo_movimiento?.detalle ?? null,

                    fechaUltimoMovimiento:
                      ultimo_movimiento?.fecha_accion ?? null,

                    loadingResumen: false,
                    errorResumen: null,
                  };
                }),

                catchError((error: unknown) =>
                  of<ExpedienteTrazabilidadListado>({
                    ...expediente,

                    loadingResumen: false,

                    errorResumen: this.obtenerMensajeError(
                      error,
                      'No se pudo cargar el resumen.',
                    ),
                  }),
                ),
              ),
          3,
        ),
      )
      .subscribe({
        next: (expedienteActualizado) => {
          this.expedientes = this.expedientes.map(
            (expediente) =>
              expediente.id_expediente ===
                expedienteActualizado.id_expediente
                ? expedienteActualizado
                : expediente,
          );

          this.cdr.markForCheck();
        },
      });
  }

  // *********************************************************
  // 3. FILTROS
  // Se aplican en el backend, antes de paginar.
  // *********************************************************

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.reiniciarPagina();
      this.listarExpedientes();
    }, 300);
  }

  onFiltroChange(): void {
    clearTimeout(this.searchTimeout);

    this.reiniciarPagina();
    this.listarExpedientes();
  }

  aplicarFiltros(): void {
    this.onFiltroChange();
  }

  limpiarFiltros(): void {
    clearTimeout(this.searchTimeout);

    this.filtroSearch = '';
    this.filtroEstado = '';
    this.filtroEstadoProcesal = '';

    this.reiniciarPagina();
    this.listarExpedientes();
  }

  // Compatibilidad con el HTML anterior.
  // No vuelve a filtrar únicamente la página actual.
  get expedientesFiltrados(): ExpedienteTrazabilidadListado[] {
    return this.expedientes;
  }

  get hayFiltros(): boolean {
    return !!(
      this.filtroSearch.trim() ||
      this.filtroEstado ||
      this.filtroEstadoProcesal
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

    this.listarExpedientes();
  }

  cambiarLimite(): void {
    clearTimeout(this.searchTimeout);

    const nuevoLimite = Number(this.limit);

    this.limit = this.pageSizeOptions.includes(nuevoLimite)
      ? nuevoLimite
      : this.pageSizeOptions[0];

    this.reiniciarPagina();
    this.listarExpedientes();
  }

  onPageSizeChange(): void {
    this.cambiarLimite();
  }

  private reiniciarPagina(): void {
    this.page = 1;
    this.currentPage = 1;
  }

  // *********************************************************
  // 5. MODAL DE TRAZABILIDAD
  // *********************************************************

  verTrazabilidad(
    expediente: ExpedientePaginadoItem,
  ): void {
    this.expedienteId = expediente.id_expediente;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.expedienteId = null;
  }

  // *********************************************************
  // 6. DOCUMENTOS
  // Conserva la ruta de tu componente anterior.
  // *********************************************************

  verDocumentos(
    expediente: ExpedientePaginadoItem,
  ): void {
    void this.router.navigate([
      '/app',
      'trazabilidad',
      expediente.id_expediente,
      'documentos',
    ]);
  }

  // *********************************************************
  // ETIQUETAS
  // *********************************************************

  getEstadoLabel(estado: ExpedienteEstado): string {
    return this.estadosDisponibles.find(
      (opcion) => opcion.value === estado,
    )?.label ?? estado;
  }

  getBadgeEstado(estado: ExpedienteEstado): string {
    const clases: Record<ExpedienteEstado, string> = {
      EN_ESPERA: 'badge-warning',
      EN_TRAMITE: 'badge-info',
      SUSPENDIDO: 'badge-accent',
      CONCLUIDO: 'badge-success',
      ARCHIVADO: 'badge-neutral',
      ANULADO: 'badge-error',
    };

    return `badge badge-outline font-semibold ${clases[estado] ?? 'badge-neutral'
      }`;
  }

  getBadgeEstadoProcesal(
    estado: ExpedienteEstadoProcesal,
  ): string {
    const base = 'badge badge-outline font-semibold';

    switch (estado) {
      case 'Prearbitral':
      case 'Instalación':
      case 'Postulatoria':
        return `${base} badge-primary`;

      case 'Fijación de puntos controvertidos':
      case 'Admisión de medios probatorios':
      case 'Actuación pericial':
      case 'Actuación probatoria':
      case 'Cierre de etapa probatoria':
        return `${base} badge-warning`;

      case 'Alegatos':
      case 'Audiencia':
        return `${base} badge-accent`;

      case 'Plazo para laudar':
      case 'Plazo para resolver pedido contra Laudo Arbitral':
        return `${base} badge-secondary`;

      case 'Concluido con Laudo Arbitral Consentido':
      case 'Concluido con pedido contra Laudo Arbitral':
        return `${base} badge-success`;

      case 'Recusación de arbitro':
      case 'Recusación de adjudicador':
      case 'Reconstitución de Tribunal Arbitral':
      case 'Reconstitución de JPRD':
        return `${base} badge-error`;

      default:
        return `${base} badge-neutral`;
    }
  }

  // *********************************************************
  // LIMPIEZA
  // *********************************************************

  private cancelarConsultas(): void {
    this.listadoSubscription?.unsubscribe();
    this.resumenSubscription?.unsubscribe();

    this.listadoSubscription = undefined;
    this.resumenSubscription = undefined;

    this.isLoading = false;
  }

  private limpiarListado(): void {
    this.expedientes = [];
    this.totalItems = 0;
    this.totalPages = 0;
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

// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';

// // Service
// import { ExpedientesService } from 'src/app/pages/features/expedientes/services/expedientes.service';
// import { VerTrazabilidadComponent } from "./components/ver-trazabilidad/ver-trazabilidad.component";
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-trazabilidad',
//   imports: [CommonModule, FormsModule, VerTrazabilidadComponent],
//   templateUrl: './trazabilidad.component.html',
//   styles: ``
// })
// export class TrazabilidadComponent implements OnInit {


//   loading = false;
//   expedientes: any[] = [];
//   trazabilidad: any[] = [];

//   mostrarModal = false;
//   expedienteId: number | null = null;

//   filtroEstado = '';
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
//     this.listarExpedientes();
//   }

//   cambiarLimite() {
//     this.page = 1;
//     this.listarExpedientes();
//   }

//   constructor(private expedientesService: ExpedientesService, private router: Router,) { }

//   ngOnInit(): void {
//     this.listarExpedientes();


//   }

//   listarExpedientes(): void {
//     this.loading = true;

//     this.expedientesService.getExpedientesPaginated({
//       page: this.page,
//       limit: this.limit,
//       // search: this.filtroSearch?.trim() || undefined,
//       // estado: this.filtroEstado || undefined,
//     }).subscribe({
//       next: (resp) => {
//         this.expedientes = resp.data;
//         this.totalItems = resp.total;
//         this.totalPages = resp.totalPages;
//         this.currentPage = resp.page;

//         //  AQUI enriquecemos cada expediente
//         this.cargarPartesYResumen();


//         this.loading = false;
//       },
//       error: (err) => {
//         this.loading = false;
//       }
//     });
//   }

//   cargarPartesYResumen() {
//     this.expedientes.forEach((exp) => {

//       this.expedientesService.obtenerPartesYResumen(exp.id_expediente)
//         .subscribe({
//           next: (resp) => {

//             // =========================
//             // DEMANDANTES
//             // =========================
//             exp.demandante = resp.partes?.demandantes?.length
//               ? resp.partes.demandantes
//                 .map((d: any) =>
//                   `${d.usuario?.nombre || ''} ${d.usuario?.apellidos || ''}`.trim()
//                 )
//                 .join(', ')
//               : '—';

//             // =========================
//             // DEMANDADOS
//             // =========================
//             exp.demandado = resp.partes?.demandados?.length
//               ? resp.partes.demandados
//                 .map((d: any) =>
//                   `${d.usuario?.nombre || ''} ${d.usuario?.apellidos || ''}`.trim()
//                 )
//                 .join(', ')
//               : '—';

//             // =========================
//             // ARBITROS
//             // =========================
//             exp.arbitros = resp.arbitros?.length
//               ? resp.arbitros.map((a: any) => ({
//                 nombre: `${a.arbitro?.usuario?.nombre || ''} ${a.arbitro?.usuario?.apellidos || ''}`.trim(),
//                 rol: a.rol,
//                 estado: a.estado,
//                 cargo: a.arbitro?.cargo,
//                 especialidad: a.arbitro?.especialidad,
//               }))
//               : [];

//             // =========================
//             // ÚLTIMO MOVIMIENTO
//             // =========================
//             if (resp.ultimoMovimiento) {
//               exp.ultimoMovimiento = resp.ultimoMovimiento.accion;
//               exp.detalleUltimoMovimiento = resp.ultimoMovimiento.detalle;

//               // Fecha completa (para pipe date)
//               exp.fechaUltimoMovimiento = new Date(
//                 resp.ultimoMovimiento.fecha
//               );
//             } else {
//               exp.ultimoMovimiento = '—';
//               exp.detalleUltimoMovimiento = null;
//               exp.fechaUltimoMovimiento = null;
//             }
//           },
//           error: () => {
//             exp.demandante = '—';
//             exp.demandado = '—';
//             exp.arbitros = [];
//           exp.arbitrosResumen = '—';
//             exp.ultimoMovimiento = '—';
//             exp.detalleUltimoMovimiento = null;
//             exp.fechaUltimoMovimiento = null;
//           }
//         });

//     });
//   }

//   get expedientesFiltrados() {
//     return this.expedientes.filter(e => {
//       const coincideEstado = this.filtroEstado
//         ? e.estadoProcesal === this.filtroEstado
//         : true;

//       const coincideBusqueda = this.filtroSearch
//         ? e.codigoExpediente.toLowerCase().includes(this.filtroSearch.toLowerCase())
//         : true;

//       return coincideEstado && coincideBusqueda;
//     });
//   }

//   getBadgeEstado(estado: string): string {
//     const map: Record<string, string> = {
//       'Suspendido': 'badge badge-soft badge-error font-semibold',
//       'En espera': 'badge badge-soft badge-neutral font-semibold',
//       'En trámite': 'badge badge-soft badge-info font-semibold',
//       'Concluido': 'badge badge-soft badge-success font-semibold',
//       'Archivado': 'badge badge-soft badge-outline font-semibold',
//     };

//     return map[estado] ?? 'badge badge-soft badge-ghost font-semibold';
//   }

//   getBadgeEstadoProcesal(estado: string): string {

//     //  FASE INICIAL
//     const inicial = [
//       'Prearbitral',
//       'Instalación',
//       'Postulatoria'
//     ];

//     //  TRÁMITE / PRUEBA
//     const tramite = [
//       'Fijación de puntos controvertidos',
//       'Admisión de medios probatorios',
//       'Actuación pericial',
//       'Actuación probatoria',
//       'Cierre de etapa probatoria'
//     ];

//     //  AUDIENCIA / ALEGATOS
//     const audiencia = [
//       'Alegatos',
//       'Audiencia'
//     ];

//     //  PLAZOS FINALES
//     const plazos = [
//       'Plazo para laudar',
//       'Plazo para resolver pedido contra Laudo Arbitral'
//     ];

//     //  CONCLUSIÓN
//     const concluido = [
//       'Concluido con Laudo Arbitral Consentido',
//       'Concluido con pedido contra Laudo Arbitral'
//     ];

//     //  INCIDENCIAS (alertas)
//     const incidencias = [
//       'Recusación de arbitro',
//       'Recusación de adjudicador',
//       'Reconstitución de Tribunal Arbitral',
//       'Reconstitución de JPRD'
//     ];

//     if (inicial.includes(estado)) return 'badge badge-soft badge-success font-semibold';
//     if (tramite.includes(estado)) return 'badge badge-soft badge-warning font-semibold';
//     if (audiencia.includes(estado)) return 'badge badge-soft badge-accent font-semibold';
//     if (plazos.includes(estado)) return 'badge badge-soft badge-secondary font-semibold';
//     if (concluido.includes(estado)) return 'badge badge-soft badge-success font-semibold';
//     if (incidencias.includes(estado)) return 'badge badge-soft badge-error font-semibold';

//     return 'badge badge-ghost';
//   }



//   verTrazabilidad(exp: any) {
//     this.expedienteId = exp.id_expediente;
//     this.mostrarModal = true;
//   }

//   verDocumentos(exp: any) {
//     this.router.navigate([`app/trazabilidad/${exp.id_expediente}/documentos`]);
//   }


//   cerrarModal() {
//     this.mostrarModal = false;
//     this.expedienteId = null;
//   }

// }
