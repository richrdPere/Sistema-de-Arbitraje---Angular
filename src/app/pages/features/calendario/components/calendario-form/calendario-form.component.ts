import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// Service
import { AuthService } from 'src/app/services/auth.service';
import { CalendarioService } from 'src/app/services/calendario.service';

@Component({
  selector: 'calendario-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './calendario-form.component.html',
  styles: ``
})
export class CalendarioFormComponent implements OnInit, OnChanges {

  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() actividadSeleccionado: any = null;

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() actividadCreado = new EventEmitter<void>();


  formActividad!: FormGroup;
  loading = false;
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
    private calendarioService: CalendarioService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initFormActividad();
    this.setModalWidth('md');

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['actividadSeleccionado'] && this.actividadSeleccionado && this.modoEdicion) {
      this.cargarActividadEnFormulario();
    }
  }

  // =====================================================
  // FORM
  // =====================================================
  initFormActividad(): void {
    this.formActividad = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      fecha_actividad: ['', Validators.required],
      tipo_actividad: ['', Validators.required],
    });
  }

  cargarActividadEnFormulario(): void {
    this.formActividad.patchValue({
      titulo: this.actividadSeleccionado.titulo,
      descripcion: this.actividadSeleccionado.descripcion,
      fecha_actividad: this.formatearFecha(this.actividadSeleccionado.fecha_actividad),
      tipo_actividad: this.actividadSeleccionado.tipo_actividad,
    });
  }

  // =====================================================
  // ACCIONES
  // =====================================================
  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();
    this.formActividad.reset();
  }

  // Crear o editar actividad
  crearOEditarActividad(): void {
    if (this.formActividad.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, complete todos los campos requeridos.',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    this.loading = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const payload = {
      ...this.formActividad.value,
      fecha_actividad: new Date(this.formActividad.value.fecha_actividad),
    };

    // =============================
    // MODO EDICIÓN
    // =============================
    if (this.modoEdicion && this.actividadSeleccionado?.id) {

      Swal.fire({
        title: '¿Actualizar actividad?',
        text: 'Se modificarán los datos de esta actividad.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#6b7280',
      }).then((result) => {
        if (!result.isConfirmed) {
          this.loading = false;
          return;
        }

        this.calendarioService
          .actualizarActividad(this.actividadSeleccionado.id, payload)
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Actualizado',
                text: 'La actividad fue actualizada correctamente.',
                timer: 1500,
                showConfirmButton: false,
              });

              this.finalizarOperacion();
            },
            error: () => {
              this.loading = false;
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar la actividad.',
                confirmButtonColor: '#ef4444',
              });
            },
          });
      });

      return;
    }

    // =============================
    // MODO CREAR
    // =============================
    this.calendarioService.crearActividad(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Actividad creada',
          text: 'La actividad se registró correctamente.',
          timer: 1500,
          showConfirmButton: false,
        });

        this.finalizarOperacion();
      },
      error: () => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la actividad.',
          confirmButtonColor: '#ef4444',
        });
      },
    });
  }

  // =====================================================
  // HELPERS
  // =====================================================
  finalizarOperacion(): void {
    this.loading = false;
    this.actividadCreado.emit();

    setTimeout(() => {
      this.cerrarModal();
    }, 1200);
  }

  formatearFecha(fecha: string | Date): string {
    const d = new Date(fecha);
    return d.toISOString().split('T')[0]; // yyyy-MM-dd
  }

}
