import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Subject,
  Subscription,
  finalize,
  takeUntil,
} from 'rxjs';

import Swal from 'sweetalert2';

// Service
import { DocumentoService } from 'src/app/pages/features/trazabilidad/services/documento.service';

// Interfaces
import {
  DocumentoPaginatedData,
} from 'src/app/pages/features/trazabilidad/interfaces/documentos';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './documentos.component.html',
  styles: ``,
})
export class DocumentosComponent implements OnDestroy {
  // *********************************************************
  // EXPEDIENTE Y DOCUMENTOS
  // *********************************************************

  idExpediente = 0;

  documentos: DocumentoPaginatedData[] = [];

  loading = false;
  mensajeError = '';

  // *********************************************************
  // PAGINACIÓN
  // *********************************************************

  page = 1;
  limit = 5;

  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  hasNextPage = false;
  hasPreviousPage = false;

  readonly pageSizeOptions = [5, 10, 20, 50];

  // *********************************************************
  // BÚSQUEDA
  // *********************************************************

  search = '';

  // *********************************************************
  // CONTROL DE OPERACIONES
  // *********************************************************

  readonly documentosEnOperacion = new Set<number>();

  private readonly destroy$ = new Subject<void>();

  private listadoSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly documentoService: DocumentoService,
    private readonly router: Router,
  ) {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.listadoSubscription?.unsubscribe();

        const id = Number(params.get('id'));

        this.documentos = [];
        this.mensajeError = '';

        this.page = 1;
        this.currentPage = 1;

        this.totalItems = 0;
        this.totalPages = 0;

        this.hasNextPage = false;
        this.hasPreviousPage = false;

        if (!Number.isSafeInteger(id) || id < 1) {
          this.idExpediente = 0;
          this.loading = false;

          this.mensajeError =
            'El expediente indicado no es válido.';

          return;
        }

        this.idExpediente = id;

        this.cargarDocumentos();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.listadoSubscription?.unsubscribe();
  }

  // *********************************************************
  // 1. CARGAR DOCUMENTOS
  // *********************************************************

  cargarDocumentos(): void {
    if (!this.idExpediente) return;

    // Evita que una consulta anterior sobrescriba
    // el resultado de los filtros actuales.
    this.listadoSubscription?.unsubscribe();

    this.loading = true;
    this.mensajeError = '';

    const idExpediente = this.idExpediente;
    const busqueda = this.search.trim();

    /*
     * El endpoint general admite search.
     * Se incluye expediente_id para limitar la búsqueda
     * al expediente actual.
     */
    const solicitud$ = busqueda
      ? this.documentoService.getDocumentosPaginated({
        page: this.page,
        limit: this.limit,
        expediente_id: idExpediente,
        search: busqueda,
        sort_by: 'fecha_subida',
        sort_order: 'DESC',
      })
      : this.documentoService.getDocumentosByExpediente(
        idExpediente,
        {
          page: this.page,
          limit: this.limit,
        },
      );

    this.listadoSubscription = solicitud$
      .pipe(
        takeUntil(this.destroy$),

        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          if (idExpediente !== this.idExpediente) return;

          const { documentos, paginacion } = response.data;

          this.documentos = documentos;

          this.totalItems = paginacion.total;
          this.totalPages = paginacion.total_pages;

          this.page = paginacion.page;
          this.currentPage = paginacion.page;
          this.limit = paginacion.limit;

          this.hasNextPage = paginacion.has_next_page;
          this.hasPreviousPage = paginacion.has_previous_page;
        },

        error: (error: unknown) => {
          this.documentos = [];

          this.totalItems = 0;
          this.totalPages = 0;

          this.hasNextPage = false;
          this.hasPreviousPage = false;

          this.mensajeError = this.obtenerMensajeError(
            error,
            'No se pudieron obtener los documentos del expediente.',
          );
        },
      });
  }

  // *********************************************************
  // 2. PAGINACIÓN
  // *********************************************************

  cambiarPagina(nuevaPagina: number): void {
    if (
      this.loading ||
      nuevaPagina < 1 ||
      nuevaPagina > this.totalPages
    ) {
      return;
    }

    this.page = nuevaPagina;

    this.cargarDocumentos();
  }

  cambiarLimite(): void {
    const nuevoLimite = Number(this.limit);

    this.limit = this.pageSizeOptions.includes(nuevoLimite)
      ? nuevoLimite
      : 5;

    this.page = 1;

    this.cargarDocumentos();
  }

  // *********************************************************
  // 3. FILTROS
  // *********************************************************

  onFiltroChange(): void {
    this.page = 1;

    this.cargarDocumentos();
  }

  // *********************************************************
  // 4. VOLVER
  // *********************************************************

  volver(): void {
    void this.router.navigate([
      '/admin',
      'trazabilidad',
    ]);
  }

  // *********************************************************
  // 5. VISUALIZAR DOCUMENTO
  // *********************************************************

  verDocumento(documento: DocumentoPaginatedData): void {
    const id = documento.id_documento;

    if (
      !documento.estado ||
      this.estaEnOperacion(id)
    ) {
      return;
    }

    const ventana = window.open('about:blank', '_blank');

    if (!ventana) {
      void Swal.fire({
        icon: 'info',
        title: 'Ventana bloqueada',
        text: 'Permite las ventanas emergentes para visualizar el documento.',
      });

      return;
    }

    ventana.opener = null;

    let navegacionIniciada = false;

    this.documentosEnOperacion.add(id);

    this.documentoService
      .getDocumentoAcceso(
        id,
        { disposicion: 'inline' },
      )
      .pipe(
        takeUntil(this.destroy$),

        finalize(() => {
          this.documentosEnOperacion.delete(id);

          // No se consulta location.href porque la navegación
          // puede seguir pendiente o estar en otro origen.
          if (!navegacionIniciada && !ventana.closed) {
            ventana.close();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (ventana.closed) return;

          try {
            const url = new URL(response.data.url);

            if (url.protocol !== 'https:') {
              throw new Error(
                'La URL del documento debe utilizar HTTPS.',
              );
            }

            ventana.location.replace(url.href);

            navegacionIniciada = true;
          } catch (error: unknown) {
            if (!ventana.closed) {
              ventana.close();
            }

            this.mostrarError(
              error,
              'No se pudo abrir el documento.',
            );
          }
        },

        error: (error: unknown) => {
          if (!ventana.closed) {
            ventana.close();
          }

          this.mostrarError(
            error,
            'No se pudo obtener el acceso al documento.',
          );
        },
      });
  }

  // *********************************************************
  // 6. DESCARGAR DOCUMENTO
  // *********************************************************

  descargarDocumento(
    documento: DocumentoPaginatedData,
  ): void {
    const id = documento.id_documento;

    if (
      !documento.estado ||
      this.estaEnOperacion(id)
    ) {
      return;
    }

    this.documentosEnOperacion.add(id);

    this.documentoService
      .getDocumentoDescarga(id)
      .pipe(
        takeUntil(this.destroy$),

        finalize(() => {
          this.documentosEnOperacion.delete(id);
        }),
      )
      .subscribe({
        next: (response) => {
          // La URL firmada indica attachment desde S3.
          const enlace = document.createElement('a');

          enlace.href = response.data.url;

          document.body.appendChild(enlace);
          enlace.click();
          enlace.remove();
        },

        error: (error: unknown) => {
          this.mostrarError(
            error,
            'No se pudo descargar el documento.',
          );
        },
      });
  }

  // *********************************************************
  // 7. PRESENTACIÓN
  // *********************************************************

  estaEnOperacion(idDocumento: number): boolean {
    return this.documentosEnOperacion.has(idDocumento);
  }

  nombreUsuario(
    documento: DocumentoPaginatedData,
  ): string {
    const usuario = documento.usuario;

    if (!usuario) {
      return 'Sin registro de usuario';
    }

    const persona = usuario.persona;

    if (!persona) {
      return usuario.correo;
    }

    const nombreCompleto = [
      persona.nombres,
      persona.apellidos,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return (
      nombreCompleto ||
      persona.razon_social ||
      persona.nombre_entidad ||
      usuario.correo
    );
  }

  // *********************************************************
  // MÉTODOS PRIVADOS
  // *********************************************************

  private mostrarError(
    error: unknown,
    mensajePredeterminado: string,
  ): void {
    void Swal.fire({
      icon: 'error',
      title: 'No se pudo completar la operación',
      text: this.obtenerMensajeError(
        error,
        mensajePredeterminado,
      ),
    });
  }

  private obtenerMensajeError(
    error: unknown,
    mensajePredeterminado: string,
  ): string {
    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    if (error && typeof error === 'object') {
      const datos = error as {
        message?: unknown;

        error?: {
          message?: unknown;
        } | string;
      };

      if (
        datos.error &&
        typeof datos.error === 'object' &&
        typeof datos.error.message === 'string'
      ) {
        return datos.error.message;
      }

      if (
        typeof datos.error === 'string' &&
        datos.error.trim()
      ) {
        return datos.error;
      }

      if (typeof datos.message === 'string') {
        return datos.message;
      }
    }

    return mensajePredeterminado;
  }
}
