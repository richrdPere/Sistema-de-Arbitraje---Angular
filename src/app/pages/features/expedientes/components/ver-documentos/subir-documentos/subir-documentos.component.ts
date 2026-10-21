import { CommonModule } from '@angular/common';

import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import {
  Subject,
  finalize,
  takeUntil,
} from 'rxjs';

import Swal from 'sweetalert2';

// Directives
import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';

// Service
import { DocumentoService } from 'src/app/pages/features/trazabilidad/services/documento.service';

// Interfaces
import {
  SubirDocumentoRequest,
} from 'src/app/pages/features/trazabilidad/interfaces/documentos';

// *********************************************************
// VALIDACIÓN — LONGITUD DEL TÍTULO SIN ESPACIOS EXTERNOS
// *********************************************************

const validarTituloDocumento: ValidatorFn = (control) => {
  const titulo = String(control.value ?? '').trim();

  if (!titulo) {
    return { required: true };
  }

  if (titulo.length < 3) {
    return {
      minlength: {
        requiredLength: 3,
        actualLength: titulo.length,
      },
    };
  }

  return null;
};

@Component({
  selector: 'subir-documentos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    UppercaseDirective,
  ],
  templateUrl: './subir-documentos.component.html',
  styles: ``,
})
export class SubirDocumentosComponent
  implements OnChanges, OnDestroy {

  // *********************************************************
  // INPUTS
  // *********************************************************

  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() expedienteId = 0;

  // *********************************************************
  // OUTPUTS
  // *********************************************************

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() documentoSubido = new EventEmitter<void>();

  // *********************************************************
  // REFERENCIAS
  // *********************************************************

  @ViewChild('archivoInput')
  archivoInput?: ElementRef<HTMLInputElement>;

  // *********************************************************
  // FORMULARIO
  // *********************************************************

  formDocumento: FormGroup<{
    titulo: FormControl<string>;
    descripcion: FormControl<string>;
    tipo_documento: FormControl<string | null>;
    file: FormControl<File | null>;
  }>;

  archivoSeleccionado: File | null = null;

  cargando = false;
  mensajeError = '';
  mensajeExito = '';

  // *********************************************************
  // SELECTOR
  // Códigos confirmados en las respuestas de tu backend.
  // *********************************************************

  readonly tipoDocumento = [
    { value: 'SOLICITUD', label: 'Solicitud' },
    { value: 'ESCRITO', label: 'Escrito' },
  ];

  // *********************************************************
  // CONFIGURACIÓN
  // *********************************************************

  modalWidthClass = 'max-w-4xl';

  private readonly maxBytes = 10 * 1024 * 1024;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly documentoService: DocumentoService,
  ) {
    this.formDocumento = this.fb.group({
      titulo: this.fb.nonNullable.control(
        '',
        [validarTituloDocumento],
      ),

      descripcion: this.fb.nonNullable.control(''),

      tipo_documento: this.fb.control<string | null>(
        null,
        [Validators.required],
      ),

      file: this.fb.control<File | null>(
        null,
        [Validators.required],
      ),
    });

    this.setModalWidth('lg');
  }

  // *********************************************************
  // CAMBIOS EN INPUTS
  // El expediente lo proporciona el componente padre.
  // *********************************************************

  ngOnChanges(changes: SimpleChanges): void {
    const seAbrioModal =
      changes['mostrarModal']?.currentValue === true;

    const cambioExpediente =
      !!changes['expedienteId'];

    if (
      this.mostrarModal &&
      !this.cargando &&
      (seAbrioModal || cambioExpediente)
    ) {
      this.reiniciarFormulario();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // *********************************************************
  // ANCHO DEL MODAL
  // *********************************************************

  setModalWidth(
    size: 'sm' | 'md' | 'lg' | 'xl' | 'full',
  ): void {
    const map = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full w-[95vw]',
    };

    this.modalWidthClass = map[size];
  }

  // *********************************************************
  // SELECCIONAR ARCHIVO
  // Se conserva la selección de PDF de tu formulario.
  // El backend verifica el contenido real.
  // *********************************************************

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.archivoSeleccionado = null;
    this.formDocumento.controls.file.setValue(null);
    this.formDocumento.controls.file.markAsTouched();

    this.mensajeError = '';

    if (!archivo) return;

    if (!/\.pdf$/i.test(archivo.name)) {
      this.mensajeError = 'Solo se permiten archivos PDF.';
      input.value = '';
      return;
    }

    if (archivo.size === 0) {
      this.mensajeError = 'El archivo está vacío.';
      input.value = '';
      return;
    }

    if (archivo.size > this.maxBytes) {
      this.mensajeError = 'El archivo no puede superar 10 MB.';
      input.value = '';
      return;
    }

    this.archivoSeleccionado = archivo;
    this.formDocumento.controls.file.setValue(archivo);
  }

  // *********************************************************
  // SUBIR DOCUMENTO
  // *********************************************************

  subirDocumento(): void {
    if (this.cargando) return;

    this.mensajeError = '';
    this.mensajeExito = '';

    this.formDocumento.markAllAsTouched();

    if (
      !Number.isSafeInteger(this.expedienteId) ||
      this.expedienteId < 1
    ) {
      this.mensajeError =
        'No se ha seleccionado un expediente válido.';

      return;
    }

    const archivo = this.archivoSeleccionado;
    const valores = this.formDocumento.getRawValue();
    const tipoDocumento = valores.tipo_documento;

    if (
      this.formDocumento.invalid ||
      !archivo ||
      !tipoDocumento
    ) {
      this.mensajeError =
        'Completa los campos obligatorios y selecciona un archivo PDF.';

      return;
    }

    const idExpediente = this.expedienteId;

    const request: SubirDocumentoRequest = {
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion.trim() || null,
      tipo_documento: tipoDocumento,
      expediente_id: idExpediente,
    };

    this.cargando = true;

    this.documentoService
      .subirDocumento(request, archivo)
      .pipe(
        takeUntil(this.destroy$),

        finalize(() => {
          this.cargando = false;
        }),
      )
      .subscribe({
        next: (response) => {
          // Evita notificar una carga anterior sobre otro expediente.
          if (idExpediente !== this.expedienteId) return;

          this.reiniciarFormulario();

          this.documentoSubido.emit();
          this.modalCerrado.emit();

          void Swal.fire({
            icon: 'success',
            title: 'Documento registrado',
            text: response.message,
            timer: 1600,
            showConfirmButton: false,
          });
        },

        error: (error: unknown) => {
          if (idExpediente !== this.expedienteId) return;

          this.mensajeError = this.obtenerMensajeError(error);
        },
      });
  }

  // *********************************************************
  // CERRAR MODAL
  // *********************************************************

  cerrarModal(): void {
    if (this.cargando) return;

    this.reiniciarFormulario();

    // El padre actualiza mostrarModal al recibir este evento.
    this.modalCerrado.emit();
  }

  // *********************************************************
  // CONTROLES
  // *********************************************************

  get f() {
    return this.formDocumento.controls;
  }

  // *********************************************************
  // MÉTODOS PRIVADOS
  // *********************************************************

  private reiniciarFormulario(): void {
    this.formDocumento.reset({
      titulo: '',
      descripcion: '',
      tipo_documento: null,
      file: null,
    });

    this.archivoSeleccionado = null;
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.archivoInput) {
      this.archivoInput.nativeElement.value = '';
    }
  }

  private obtenerMensajeError(error: unknown): string {
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

    return 'No se pudo subir el documento. Inténtalo nuevamente.';
  }
}
