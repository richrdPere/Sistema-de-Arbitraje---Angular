import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Services
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'subir-documentos',
  imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
  templateUrl: './subir-documentos.component.html',
  styles: ``
})
export class SubirDocumentosComponent implements OnInit {
  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() expedienteId!: number; // ID del expediente (por ejemplo 11)

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() documentoSubido = new EventEmitter<void>();

  formDocumento!: FormGroup;
  archivoSeleccionado: File | null = null;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';

  modalWidthClass = 'max-w-4xl'; // default

  setModalWidth(size: 'sm' | 'md' | 'lg' | 'xl' | 'full') {
    const map = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full w-[95vw]'
    };

    this.modalWidthClass = map[size];
  }

  constructor(
    private fb: FormBuilder,
    private expedientesService: ExpedientesService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {

    this.inicializarFormulario();
  }
  ngOnInit(): void {
    this.setModalWidth('lg');

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.expedienteId = Number(id);

      }
    });
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
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos y selecciona un archivo PDF.',
        confirmButtonColor: '#0a1a35',
      });
      return;
    }

    this.cargando = true;

    // Alerta de carga
    Swal.fire({
      title: 'Subiendo documento',
      text: 'Por favor espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });


    // this.mensajeError = '';
    // this.mensajeExito = '';

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

        Swal.fire({
          icon: 'success',
          title: 'Documento registrado',
          text: 'El documento fue subido correctamente al expediente.',
          confirmButtonColor: '#0a1a35',
          timer: 1500,
          showConfirmButton: false,
        });

        this.documentoSubido.emit();
        setTimeout(() => this.cerrarModal(), 1500);
      },
      error: (err) => {
        this.cargando = false;

        Swal.fire({
          icon: 'error',
          title: 'Error al subir documento',
          text: err.error?.message || 'Ocurrió un error al subir el documento.',
          confirmButtonColor: '#0a1a35',
        });


        // this.mensajeError = err.error?.message || 'Error al subir el documento.';
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
