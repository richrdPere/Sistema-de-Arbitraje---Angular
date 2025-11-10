import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Services
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { AuthService } from 'src/app/services/auth.service';



@Component({
  selector: 'subir-documento-secretaria',
  imports: [ReactiveFormsModule],
  templateUrl: './subir-documento-secretaria.component.html',
})
export class SubirDocumentoSecretariaComponent {
  @Input() mostrarModal = false;
  @Input() expedienteId!: number; // ID del expediente (por ejemplo 11)

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() documentoSubido = new EventEmitter<void>();

  formDocumento!: FormGroup;
  archivoSeleccionado: File | null = null;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private fb: FormBuilder,
    private expedientesService: ExpedientesService,
    private authService: AuthService
  ) {

    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.formDocumento = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      version: [1, Validators.min(1)],
      tipo_documento: ['', Validators.required],
      file: [null, Validators.required],
    });
  }

  //  Evento al seleccionar archivo
  onArchivoSeleccionado(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.archivoSeleccionado = file;
      this.formDocumento.patchValue({ file: file });
      this.mensajeError = '';
    } else {
      this.archivoSeleccionado = null;
      this.formDocumento.patchValue({ file: null });
      this.mensajeError = 'Solo se permiten archivos PDF.';
    }
  }

  //  Enviar formulario
  subirDocumento(): void {
    if (this.formDocumento.invalid || !this.archivoSeleccionado) {
      this.mensajeError = 'Por favor completa todos los campos y selecciona un PDF.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const formData = new FormData();
    formData.append('titulo', this.formDocumento.value.titulo);
    formData.append('descripcion', this.formDocumento.value.descripcion);
    formData.append('version', this.formDocumento.value.version);
    formData.append('tipo_documento', this.formDocumento.value.tipo_documento);
    formData.append('file', this.archivoSeleccionado);
    formData.append('fecha_emision', new Date().toISOString());

    this.expedientesService.subirDocumento(this.expedienteId, formData).subscribe({
      next: () => {
        this.cargando = false;
        this.mensajeExito = 'Documento subido correctamente.';
        this.documentoSubido.emit();
        setTimeout(() => this.cerrarModal(), 1000);
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al subir documento:', err);
        this.mensajeError = err.error?.message || 'Error al subir el documento.';
      },
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();
    this.formDocumento.reset();
    this.archivoSeleccionado = null;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  get f() {
    return this.formDocumento.controls;
  }
}
