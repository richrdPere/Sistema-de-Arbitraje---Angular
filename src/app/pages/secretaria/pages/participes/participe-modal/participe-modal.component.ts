import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

// Service
import { ParticipeService } from 'src/app/services/admin/participes.service';

// Interface
import { Participe } from 'src/app/interfaces/users/participeUser';

@Component({
  selector: 'participes-modal-secretaria',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './participe-modal.component.html',
})
export class ParticipeModalComponent implements OnInit, OnChanges {


  @Input() mostrarModal = false;
  @Input() modoEdicion = false; // ← Nuevo flag
  @Input() participeSeleccionado: any = null; // ← Datos al editar

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() participeCreado = new EventEmitter<void>();

  formParticipe!: FormGroup;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(private fb: FormBuilder, private participeService: ParticipeService) {
    this.formParticipe = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      cargo: ['', [Validators.required]],
      rol_participe: ['', [Validators.required]],
      rol: ['participe'],
    });
  }

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si estamos en modo edición, llenamos el formulario
    if (this.modoEdicion && this.participeSeleccionado) {
      this.llenarFormulario(this.participeSeleccionado);
    }
  }

  inicializarFormulario(): void {
    this.formParticipe = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      documento_identidad: ['', [Validators.required, Validators.pattern('^[0-8]+$')]],
      cargo: ['', Validators.required],
      rol_participe: ['', Validators.required],

      // rol fijo según tu backend
      rol: ['participe'],
    });
  }

  llenarFormulario(participe: any): void {
    this.formParticipe.patchValue({
      nombre: participe.usuario?.nombre,
      apellidos: participe.usuario?.apellidos,
      correo: participe.usuario?.correo,
      telefono: participe.usuario?.telefono,
      documento_identidad: participe.usuario?.documento_identidad,
      cargo: participe.cargo,
      rol_participe: participe.rol_participe,
    });
  }

  guardar() {
    if (this.formParticipe.invalid) {
      Swal.fire('Atención', 'Por favor, completa todos los campos requeridos.', 'warning');
      return;
    }

    if (this.modoEdicion && this.participeSeleccionado) {
      this.actualizarParticipe();
    } else {
      this.crearParticipe();
    }
  }

  private actualizarParticipe() {
    const id = this.participeSeleccionado!.id_participe;
    this.participeService.actualizarParticipe(id, this.formParticipe.value).subscribe({
      next: () => {
        Swal.fire('Actualizado', 'Partícipe actualizado correctamente', 'success');
        this.participeCreado.emit();
        this.cerrarModal();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar el partícipe', 'error');
      },
    });
  }


  //  Enviar formulario
  crearParticipe(): void {
    if (this.formParticipe.invalid) {
      this.mensajeError = 'Por favor completa todos los campos requeridos.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const data = this.formParticipe.value;

    if (this.modoEdicion && this.participeSeleccionado) {

      //  Editar
      const id = this.participeSeleccionado.id_participe;
      this.participeService.crearParticipe(data).subscribe({
        next: (resp) => {
          this.cargando = false;
          Swal.fire('Actualizado', 'El partícipe fue actualizado correctamente.', 'success');
          this.mensajeExito = ' Partícipe creado exitosamente.';
          // console.log('Respuesta:', resp);

          // Notificar al componente padre que se creó un partícipe
          this.participeCreado.emit();

          // Cerrar el modal tras un pequeño delay
          setTimeout(() => {
            this.cerrarModal();
          }, 1000);
        },
        error: (err) => {
          this.cargando = false;
          console.error('Error al crear el partícipe:', err);
          this.mensajeError = err.error?.message || ' Error al crear el partícipe.';
          Swal.fire('Error', 'No se pudo actualizar el partícipe.', 'error');
        },
      });
    } else {
      //  Crear
      this.participeService.crearParticipe(data).subscribe({
        next: (resp) => {
          this.cargando = false;
          Swal.fire('Creado', 'Partícipe creado exitosamente.', 'success');
          this.participeCreado.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.cargando = false;
          console.error('Error al crear el partícipe:', err);
          this.mensajeError = err.error?.message || 'Error al crear el partícipe.';
        },
      });
    }
  }

  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.formParticipe.reset({
      tipo_persona: 'Natural',
      rol: 'participe',
    });
    this.modalCerrado.emit();
  }

  get f() {
    return this.formParticipe.controls;
  }
}
