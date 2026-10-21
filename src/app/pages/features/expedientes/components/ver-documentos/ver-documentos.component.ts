import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription, finalize, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

// Directives
import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';

// Component
import { SubirDocumentosComponent } from './subir-documentos/subir-documentos.component';

// Service
import { DocumentoService } from 'src/app/pages/features/trazabilidad/services/documento.service';

// Interfaces
import { DocumentoPaginatedData, GetDocumentosPaginatedFilters } from 'src/app/pages/features/trazabilidad/interfaces/documentos';

type ModoFormularioDocumento = 'editar' | 'version' | null;

@Component({
  selector: 'app-ver-documentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    UppercaseDirective,
    SubirDocumentosComponent,
  ],
  templateUrl: './ver-documentos.component.html',
})
export class VerDocumentosComponent implements OnDestroy {
  // *********************************************************
  // EXPEDIENTE
  // *********************************************************

  idExpediente = 0;
  numeroExpediente: string | null = null;

  // *********************************************************
  // LISTADO
  // *********************************************************

  documentos: DocumentoPaginatedData[] = [];

  loading = false;
  mensajeError = '';
  mensajeExito = '';

  // *********************************************************
  // MODAL — SUBIR DOCUMENTO
  // *********************************************************

  mostrarModal = false;
  expedienteSeleccionadoId = 0;

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
  // FILTROS
  // *********************************************************

  search = '';
  soloUltimaVersion = true;

  // *********************************************************
  // FORMULARIO — METADATOS / NUEVA VERSIÓN
  // *********************************************************

  modoFormulario: ModoFormularioDocumento = null;
  documentoSeleccionado: DocumentoPaginatedData | null = null;

  tituloFormulario = '';
  descripcionFormulario = '';
  archivoVersion: File | null = null;

  guardandoFormulario = false;
  errorFormulario = '';

  // *********************************************************
  // CONTROL DE OPERACIONES Y SUSCRIPCIONES
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
        const id = Number(params.get('id'));

        this.listadoSubscription?.unsubscribe();

        this.mostrarModal = false;
        this.reiniciarFormulario();

        this.documentos = [];
        this.numeroExpediente = null;
        this.mensajeError = '';
        this.mensajeExito = '';

        this.page = 1;
        this.currentPage = 1;
        this.totalItems = 0;
        this.totalPages = 0;
        this.hasNextPage = false;
        this.hasPreviousPage = false;

        if (!Number.isSafeInteger(id) || id < 1) {
          this.idExpediente = 0;
          this.loading = false;
          this.mensajeError = 'El expediente indicado no es válido.';
          return;
        }

        this.idExpediente = id;
        this.expedienteSeleccionadoId = id;

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

    // Cancela la consulta anterior cuando cambian los filtros.
    this.listadoSubscription?.unsubscribe();

    this.loading = true;
    this.mensajeError = '';

    const idExpediente = this.idExpediente;
    const busqueda = this.search.trim();

    /*
     * El endpoint paginado general permite search.
     * Siempre se incluye expediente_id para mantener el contexto.
     *
     * Sin búsqueda se utiliza el endpoint por expediente.
     */
    const filters: GetDocumentosPaginatedFilters = {
      page: this.page,
      limit: this.limit,
      expediente_id: idExpediente,
      search: busqueda,
      solo_ultima_version: this.soloUltimaVersion,
      sort_by: 'fecha_subida',
      sort_order: 'DESC',
    };

    const solicitud$ = busqueda
      ? this.documentoService.getDocumentosPaginated(filters)
      : this.documentoService.getDocumentosByExpediente(
        idExpediente,
        {
          page: this.page,
          limit: this.limit,
          solo_ultima_version: this.soloUltimaVersion,
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

          const expediente = documentos.find(
            (documento) =>
              documento.expediente?.id_expediente === idExpediente,
          )?.expediente;

          if (expediente) {
            this.numeroExpediente = expediente.numero_expediente;
          }

          // Puede ocurrir tras cambiar estados o agrupar versiones.
          if (
            documentos.length === 0 &&
            this.page > 1
          ) {
            this.page = Math.max(
              1,
              Math.min(this.page - 1, this.totalPages),
            );

            this.cargarDocumentos();
          }
        },

        error: (error: unknown) => {
          this.documentos = [];
          this.totalItems = 0;
          this.totalPages = 0;
          this.hasNextPage = false;
          this.hasPreviousPage = false;

          this.mensajeError = this.obtenerMensajeError(
            error,
            'No se pudieron obtener los documentos.',
          );
        },
      });
  }

  // *********************************************************
  // 2. PAGINACIÓN Y FILTROS
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

  onFiltroChange(): void {
    this.page = 1;
    this.cargarDocumentos();
  }

  // *********************************************************
  // 3. MODAL — SUBIR DOCUMENTO
  // *********************************************************

  abrirModal(): void {
    if (!this.idExpediente) return;

    this.expedienteSeleccionadoId = this.idExpediente;
    this.mostrarModal = true;
  }

  abrirModalDocumento(id: number): void {
    if (id !== this.idExpediente) return;

    this.abrirModal();
  }

  cerrarModalDocumento(): void {
    this.mostrarModal = false;
  }

  onDocumentoSubido(): void {
    this.cerrarModalDocumento();

    this.mensajeExito = 'Documento subido correctamente.';
    this.page = 1;

    this.cargarDocumentos();
  }

  // *********************************************************
  // 4. VISUALIZAR DOCUMENTO
  // *********************************************************

  verDocumento(documento: DocumentoPaginatedData): void {
    const id = documento.id_documento;

    if (
      !documento.estado ||
      this.estaEnOperacion(id)
    ) {
      return;
    }

    // Abrir directamente durante el clic.
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

    // Controlar la navegación sin leer ventana.location.href.
    let navegacionIniciada = false;

    this.documentosEnOperacion.add(id);

    this.documentoService
      .getDocumentoAcceso(id, {
        disposicion: 'inline',
      })
      .pipe(
        takeUntil(this.destroy$),

        finalize(() => {
          this.documentosEnOperacion.delete(id);

          // Cerrar únicamente si no se llegó a navegar.
          // También cubre la cancelación de la petición.
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

            // La solicitud de navegación se realizó correctamente.
            // No significa que S3 ya haya terminado de cargar.
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
  // 5. DESCARGAR DOCUMENTO
  // *********************************************************

  descargarDocumento(documento: DocumentoPaginatedData): void {
    if (
      !documento.estado ||
      this.estaEnOperacion(documento.id_documento)
    ) {
      return;
    }

    const id = documento.id_documento;

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
          // S3 establece Content-Disposition: attachment.
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
  // 6. ABRIR FORMULARIO DE METADATOS
  // *********************************************************

  editarDocumento(documento: DocumentoPaginatedData): void {
    if (this.estaEnOperacion(documento.id_documento)) return;

    this.prepararFormulario(documento, 'editar');
  }

  // *********************************************************
  // 7. ABRIR FORMULARIO DE NUEVA VERSIÓN
  // *********************************************************

  nuevaVersion(documento: DocumentoPaginatedData): void {
    if (
      !documento.estado ||
      this.estaEnOperacion(documento.id_documento)
    ) {
      return;
    }

    this.prepararFormulario(documento, 'version');
  }

  seleccionarArchivoVersion(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.archivoVersion = null;
    this.errorFormulario = '';

    if (!archivo) return;

    if (archivo.size === 0) {
      this.errorFormulario = 'El archivo está vacío.';
      input.value = '';
      return;
    }

    if (archivo.size > 10 * 1024 * 1024) {
      this.errorFormulario = 'El archivo no puede superar 10 MB.';
      input.value = '';
      return;
    }

    this.archivoVersion = archivo;
  }

  // *********************************************************
  // 8. GUARDAR METADATOS / NUEVA VERSIÓN
  // *********************************************************

  guardarFormulario(): void {
    const documento = this.documentoSeleccionado;
    const modo = this.modoFormulario;

    if (
      !documento ||
      !modo ||
      this.guardandoFormulario
    ) {
      return;
    }

    const titulo = this.tituloFormulario.trim();
    const descripcion = this.descripcionFormulario.trim();

    this.errorFormulario = '';

    if (!titulo) {
      this.errorFormulario = 'El título es obligatorio.';
      return;
    }

    if (modo === 'version' && !this.archivoVersion) {
      this.errorFormulario = 'Selecciona el archivo de la nueva versión.';
      return;
    }

    const idExpediente = this.idExpediente;
    const idDocumento = documento.id_documento;

    let solicitud$: Observable<{ message: string }>;

    if (modo === 'editar') {
      solicitud$ = this.documentoService.updateDocumentoMetadatos(
        idDocumento,
        {
          titulo,
          descripcion: descripcion || null,
        },
      );
    } else {
      const archivo = this.archivoVersion;

      if (!archivo) return;

      solicitud$ = this.documentoService.crearDocumentoVersion(
        idDocumento,
        {
          titulo,
          descripcion,
        },
        archivo,
      );
    }

    this.guardandoFormulario = true;
    this.documentosEnOperacion.add(idDocumento);

    solicitud$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.guardandoFormulario = false;
          this.documentosEnOperacion.delete(idDocumento);
        }),
      )
      .subscribe({
        next: (response) => {
          if (idExpediente !== this.idExpediente) return;

          this.reiniciarFormulario();

          this.mensajeExito = response.message;

          if (modo === 'version') {
            this.page = 1;
          }

          this.cargarDocumentos();
        },

        error: (error: unknown) => {
          if (idExpediente !== this.idExpediente) return;

          this.errorFormulario = this.obtenerMensajeError(
            error,
            modo === 'editar'
              ? 'No se pudieron actualizar los metadatos.'
              : 'No se pudo crear la nueva versión.',
          );
        },
      });
  }

  cerrarFormulario(): void {
    if (this.guardandoFormulario) return;

    this.reiniciarFormulario();
  }

  // *********************************************************
  // 9. CAMBIAR ESTADO
  // *********************************************************

  async cambiarEstado(
    documento: DocumentoPaginatedData,
  ): Promise<void> {
    const id = documento.id_documento;

    if (this.estaEnOperacion(id)) return;

    const idExpediente = this.idExpediente;
    const nuevoEstado = !documento.estado;

    const resultado = await Swal.fire({
      title: nuevoEstado
        ? '¿Habilitar documento?'
        : '¿Deshabilitar documento?',

      text: nuevoEstado
        ? 'El documento volverá a estar disponible para su acceso.'
        : 'El documento conservará su registro, pero su acceso quedará deshabilitado.',

      icon: 'warning',
      showCancelButton: true,

      confirmButtonText: nuevoEstado
        ? 'Sí, habilitar'
        : 'Sí, deshabilitar',

      cancelButtonText: 'Cancelar',
    });

    if (
      !resultado.isConfirmed ||
      idExpediente !== this.idExpediente ||
      this.estaEnOperacion(id)
    ) {
      return;
    }

    this.documentosEnOperacion.add(id);

    this.documentoService
      .cambiarDocumentoEstado(
        id,
        { estado: nuevoEstado },
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.documentosEnOperacion.delete(id);
        }),
      )
      .subscribe({
        next: (response) => {
          if (idExpediente !== this.idExpediente) return;

          // Usar el estado confirmado por el backend.
          documento.estado = response.data.estado;

          this.mensajeExito = response.message;
          this.cargarDocumentos();
        },

        error: (error: unknown) => {
          this.mostrarError(
            error,
            'No se pudo cambiar el estado del documento.',
          );
        },
      });
  }

  // *********************************************************
  // 10. PRESENTACIÓN
  // *********************************************************

  estaEnOperacion(idDocumento: number): boolean {
    return this.documentosEnOperacion.has(idDocumento);
  }

  nombreUsuario(documento: DocumentoPaginatedData): string {
    const usuario = documento.usuario;

    if (!usuario) return 'Sin registro de usuario';

    const persona = usuario.persona;

    if (!persona) return usuario.correo;

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

  formatoTamano(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  volver(): void {
    void this.router.navigate([
      '/admin',
      'expedientes',
    ]);
  }

  // *********************************************************
  // MÉTODOS PRIVADOS
  // *********************************************************

  private prepararFormulario(
    documento: DocumentoPaginatedData,
    modo: Exclude<ModoFormularioDocumento, null>,
  ): void {
    this.documentoSeleccionado = documento;
    this.modoFormulario = modo;

    this.tituloFormulario = documento.titulo;
    this.descripcionFormulario = documento.descripcion ?? '';

    this.archivoVersion = null;
    this.errorFormulario = '';
  }

  private reiniciarFormulario(): void {
    this.modoFormulario = null;
    this.documentoSeleccionado = null;

    this.tituloFormulario = '';
    this.descripcionFormulario = '';
    this.archivoVersion = null;

    this.errorFormulario = '';
  }

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

      if (typeof datos.error === 'string' && datos.error.trim()) {
        return datos.error;
      }

      if (typeof datos.message === 'string') {
        return datos.message;
      }
    }

    return mensajePredeterminado;
  }
}

// import { CommonModule, DatePipe } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { SubirDocumentosComponent } from "./subir-documentos/subir-documentos.component";
// import { FormsModule } from '@angular/forms';
// import Swal from 'sweetalert2';

// // Service
// import { ExpedientesService } from 'src/app/pages/features/expedientes/services/expedientes.service';
// import { DocumentoService } from 'src/app/pages/features/trazabilidad/services/documento.service';


// @Component({
//   selector: 'app-ver-documentos',
//   imports: [CommonModule, FormsModule, DatePipe, SubirDocumentosComponent],
//   templateUrl: './ver-documentos.component.html',
// })
// export class VerDocumentosComponent implements OnInit {

//   idExpediente!: number;
//   documentos: any[] = [];
//   loading = true;
//   mensajeError = '';
//   mensajeExito = '';

//   mostrarModal = false;
//   expedienteSeleccionadoId!: number;
//   numeroExpediente: string | null = null;

//   // Paginado
//   page = 1;
//   limit = 5;
//   totalItems = 0;
//   totalPages = 0;
//   currentPage = 1;

//   pageSizeOptions = [5, 10, 20, 50];

//   // Search
//   search: string = '';
//   rolFiltro: string = '';

//   constructor(
//     private route: ActivatedRoute,
//     private expedienteService: ExpedientesService,
//     private documentoService: DocumentoService,
//     private router: Router
//   ) { }

//   ngOnInit(): void {
//     this.route.paramMap.subscribe(params => {
//       const id = Number(params.get('id'));

//       if (!id) return;

//       this.idExpediente = id;

//       this.cargarDatosExpediente();
//       this.cargarDocumentos();
//     });
//   }

//   cargarDatosExpediente() {
//     // this.expedienteService.getExpedienteById(this.idExpediente)
//     //   .subscribe({
//     //     next: (exp) => {
//     //       this.numeroExpediente = exp.numero_expediente;
//     //     },
//     //     error: () => {
//     //       this.numeroExpediente = 'No disponible';
//     //     }
//     //   });
//   }

//   cargarDocumentos() {
//     this.loading = true;

//     const params: any = {
//       page: this.page,
//       limit: this.limit,
//       search: this.search || null,
//     };

//     // this.expedienteService.listarDocumentos(this.idExpediente, params)
//     //   .subscribe({
//     //     next: (resp) => {

//     //       this.documentos = resp.data;   // ✅ ahora sí
//     //       this.totalItems = resp.total;
//     //       this.totalPages = resp.totalPages;
//     //       this.currentPage = resp.page;

//     //       this.loading = false;
//     //     },
//     //     error: (err) => {
//     //       this.loading = false;
//     //       this.mensajeError = err.error?.message || 'Error al cargar documentos';
//     //     }
//     //   });
//   }

//   cambiarPagina(nuevaPagina: number) {
//     if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
//     this.page = nuevaPagina;
//     this.cargarDocumentos();
//   }

//   cambiarLimite() {
//     this.limit = Number(this.limit);
//     this.page = 1;
//     this.cargarDocumentos();
//   }


//   onFiltroChange() {
//     this.page = 1;
//     this.cargarDocumentos();
//   }

//   abrirModal() {
//     this.mostrarModal = true;
//     // this.expedienteSeleccionadoId = id;
//     this.mostrarModal = true;
//   }


//   abrirModalDocumento(id: number) {
//     this.expedienteSeleccionadoId = id;
//     this.mostrarModal = true;
//   }

//   cerrarModalDocumento() {
//     this.mostrarModal = false;
//     this.mostrarModal = false;
//   }

//   volver() {
//     this.router.navigate(['/app/expedientes']);
//   }

//   eliminarDocumento(id: any) {
//     Swal.fire({
//       title: '¿Eliminar documento?',
//       text: 'Esta acción no se puede deshacer.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Sí, eliminar',
//     }).then(result => {
//       if (result.isConfirmed) {
//         this.documentoService.eliminarDocumento(id).subscribe({
//           next: () => {
//             Swal.fire({ icon: 'success', title: 'Documento eliminado correctamente' });
//             this.cargarDocumentos();
//           },
//           error: (err) => {
//             Swal.fire({
//               icon: 'error',
//               title: 'Error al eliminar documento',
//               text: err.error?.message || 'Error inesperado',
//             });
//           },
//         });
//       }
//     });
//   }

//   verDocumento(doc: any) {
//     if (!doc?.url_s3) {

//       return;
//     }

//     const url = doc.url_s3; // debe ser un link válido (https://...)
//     window.open(url, "_blank");
//   }
// }
