import { Component, EventEmitter, Input, OnInit, Output, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Services
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'expediente-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './form-expediente-modal.component.html',
})
export class FormExpedienteModalComponent implements OnInit {

  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() expedienteSeleccionado: any = null;

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() expedienteCreado = new EventEmitter<void>();


  formExpediente!: FormGroup;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';
  @ViewChild('numeroInput') numeroInput!: ElementRef;
  //  Variable para guardar el ID de la secretaria logueada
  secretariaId: number | null = null;


  constructor(private fb: FormBuilder, private expedientesService: ExpedientesService, private authService: AuthService) { }


  ngOnInit() {
    this.inicializarFormulario();
    this.obtenerSecretariaId();

    if (this.modoEdicion && this.expedienteSeleccionado) {
      this.formExpediente.patchValue({
        titulo: this.expedienteSeleccionado.titulo,
        descripcion: this.expedienteSeleccionado.descripcion,
        tipo: this.expedienteSeleccionado.tipo,
        estado_procesal: this.expedienteSeleccionado.estado_procesal,
        codigo: this.expedienteSeleccionado.codigo,
        fecha_inicio: this.expedienteSeleccionado.fecha_inicio,
        fecha_laudo: this.expedienteSeleccionado.fecha_laudo,
        fecha_resolucion: this.expedienteSeleccionado.fecha_resolucion,
      });
    }

  }

  //  Obtener ID del usuario logueado (secretaria)
  private obtenerSecretariaId(): void {
    const usuario = this.authService.getUser(); // obtiene desde BehaviorSubject o localStorage
    if (usuario && usuario.rol === 'secretaria' && usuario.detalles) {
      this.secretariaId = usuario.detalles.id_secretaria;


      console.log(' Secretaria logueada:', usuario.nombre);
      console.log(' ID de secretaria:', this.secretariaId);
      console.log(' ID de secretaria logueada:', this.secretariaId);
    } else if (usuario) {
      console.warn(` El usuario logueado (${usuario.nombre}) no es una secretaria o no tiene detalles asociados.`);
    } else {
      console.warn(' No se encontró información del usuario logueado.');
    }
  }

  inicializarFormulario(): void {
    this.formExpediente = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      tipo: [''],
      estado_procesal: [''],
      numero: ['', Validators.required],
      anio: ['', Validators.required],
      codigo: ['', Validators.required],
      fecha_inicio: [''],
      fecha_laudo: [''],
      fecha_resolucion: [''],
    });
  }

  // Enviar Formulario
  crearOEditarExpediente(): void {
    if (this.formExpediente.invalid) {
      this.mensajeError = 'Por favor completa todos los campos requeridos.';
      return;
    }

    if (!this.secretariaId) {
      this.mensajeError = 'No se encontró la sesión de la secretaria.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const data = this.formExpediente.value;

    //  Construimos el número de expediente
    const numeroExpediente = `${data.numero}-${data.anio}/${data.codigo}`;

    //  Objeto final para enviar al backend
    const expedienteData = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      estado_procesal: data.estado_procesal,
      numero_expediente: numeroExpediente,
      codigo: data.codigo,
      fecha_inicio: data.fecha_inicio,
      fecha_laudo: data.fecha_laudo,
      fecha_resolucion: data.fecha_resolucion,
      secretaria_id: this.secretariaId,
    };

    // Si existe id_expediente => EDITAR
    if (this.modoEdicion && this.expedienteSeleccionado?.id_expediente) {
      this.expedientesService.actualizarExpediente(this.expedienteSeleccionado.id_expediente, expedienteData).subscribe({
        next: (resp) => {
          this.cargando = false;
          this.mensajeExito = 'Expediente actualizado correctamente.';
          console.log('Actualizado:', resp);
          this.expedienteCreado.emit(); // también refresca la tabla

          setTimeout(() => this.cerrarModal(), 1000);
        },
        error: (err) => {
          this.cargando = false;
          console.error('Error al actualizar expediente:', err);
          this.mensajeError = err.error?.message || 'Error al actualizar el expediente.';
        },
      });
    }

    // Si no existe id_expediente => CREAR
    else {
      this.expedientesService.crearExpediente(expedienteData).subscribe({
        next: (resp) => {
          this.cargando = false;
          this.mensajeExito = 'Expediente creado exitosamente.';
          console.log('Creado:', resp);
          this.expedienteCreado.emit();

          setTimeout(() => this.cerrarModal(), 1000);
        },
        error: (err) => {
          this.cargando = false;
          console.error('Error al crear expediente:', err);
          this.mensajeError = err.error?.message || 'Error al crear el expediente.';
        },
      });
    }
  }

  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    // this.formExpediente.reset({
    //   tipo_persona: 'Natural',
    //   rol: 'participe',
    // });
    this.modalCerrado.emit();
  }

  get f() {
    return this.formExpediente.controls;
  }



}
