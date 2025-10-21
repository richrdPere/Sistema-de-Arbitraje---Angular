import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParticipeService } from 'src/app/services/admin/participes.service';

@Component({
  selector: 'app-participes-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './participes-modal.component.html',
})
export class ParticipesModalComponent implements OnInit {

  @Input() mostrarModal = false;
  @Output() modalCerrado = new EventEmitter<void>();
  @Output() participeCreado = new EventEmitter<void>();

  formParticipe!: FormGroup;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(private fb: FormBuilder, private participeService: ParticipeService) { }

  ngOnInit(): void {
    this.inicializarFormulario();
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

    this.participeService.crearParticipe(data).subscribe({
      next: (resp) => {
        this.cargando = false;
        this.mensajeExito = ' Partícipe creado exitosamente.';
        console.log('Respuesta:', resp);

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
      },
    });
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
