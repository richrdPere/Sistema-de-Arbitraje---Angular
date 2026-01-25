import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Service
import { ParticipeService } from 'src/app/services/admin/participes.service';

// Interface
import { Participe } from 'src/app/interfaces/users/participeUser';


@Component({
  selector: 'participe-modal',
  imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
  templateUrl: './participe-modal.component.html',
  styles: ``
})
export class ParticipeModalComponent implements OnInit, OnChanges {
  @Input() mostrarModal = false;
  @Input() modoEdicion = false; // ← Nuevo flag
  @Input() participeSeleccionado: any = null; // ← Datos al editar

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() participeCreado = new EventEmitter<void>();

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

  formParticipe!: FormGroup;
  isEntidad: boolean = false;

  cargando = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(private fb: FormBuilder, private participeService: ParticipeService) {

  }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.setModalWidth('lg');
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
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      tipo_documento: ['', [Validators.required]],
      tipo_demandado: ['', Validators.required],
      documento_identidad: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      cargo: ['', Validators.required],
      rol_participe: ['', Validators.required],

      // rol fijo según tu backend
      // rol: ['participe'],
    });
  }

  llenarFormulario(participe: any): void {
    this.formParticipe.patchValue({
      nombre: participe.usuario?.nombre,
      apellidos: participe.usuario?.apellidos,
      correo: participe.usuario?.correo,
      telefono: participe.usuario?.telefono,
      documento_identidad: participe.usuario?.documento_identidad,
      tipo_documento: participe.usuario?.tipo_documento,
      tipo_demandado: participe.tipo_demandado,
      cargo: participe.cargo,
      rol_participe: participe.rol_participe,
    });

    // Ajustar estado entidad/persona
    this.isEntidad = participe.tipo_demandado === 'entidad';
  }

  //  Enviar formulario
  crearOEditarParticipe(): void {
    if (this.formParticipe.invalid) {
      this.mensajeError = 'Por favor completa todos los campos requeridos.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const participe: any = { ...this.formParticipe.value }

    console.log('Formulario de participe enviado:', participe);

    if (this.modoEdicion && this.participeSeleccionado?.id_participe) {

      // ============================
      // MODO EDICIÓN
      // ============================
      const id = this.participeSeleccionado?.id_participe;

      this.participeService.actualizarParticipe(id, participe).subscribe({
        next: () => {
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

      return;
    }

    // ============================
    // MODO CREACIÓN
    // ============================
    this.participeService.crearParticipe(participe).subscribe({
      next: () => {
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

  onTipoDemandadoChange() {
    const tipo = this.formParticipe.get('tipo_demandado')?.value;

    this.isEntidad = tipo === 'entidad';

    // const nombre = this.formParticipe.get('nombre');
    const apellidos = this.formParticipe.get('apellidos');

    if (this.isEntidad) {
      // Limpia campos de persona
      apellidos?.clearValidators();
      apellidos?.setValue('DATO NO PROPORCIONADO');
      // apellidos?.updateValueAndValidity();
    } else {
      // Limpia el campo de entidad
      apellidos?.setValidators([Validators.required, Validators.minLength(3)]);
      apellidos?.setValue('');
      // apellidos?.updateValueAndValidity();

    }

    apellidos?.updateValueAndValidity();
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
