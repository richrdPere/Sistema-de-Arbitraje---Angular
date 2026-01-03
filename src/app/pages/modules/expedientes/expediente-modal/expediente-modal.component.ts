import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Services
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'expediente-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './expediente-modal.component.html',
  styles: ``
})
export class ExpedienteModalComponent implements OnInit, OnChanges {
  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() expedienteSeleccionado: any = null;

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() expedienteCreado = new EventEmitter<void>();


  formExpediente!: FormGroup;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';
  secretariaId: number | null = null;

  // Step
  currentStep = 1;
  totalSteps = 3;


  constructor(
    private fb: FormBuilder,
    private expedientesService: ExpedientesService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.obtenerSecretariaId();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detecta cuando cambian los inputs
    if ((changes['expedienteSeleccionado'] || changes['mostrarModal']) && this.modoEdicion && this.expedienteSeleccionado) {
      this.patchFormExpediente();
    }
  }

  private formatearFecha(fecha: string | null): string | null {
    if (!fecha) return null;
    return fecha.split('T')[0]; // Extrae solo YYYY-MM-DD
  }


  //  Función para descomponer el número de expediente
  private extraerParte(numeroExpediente: string, parte: 'numero' | 'anio' | 'codigo'): string {
    if (!numeroExpediente) return '';
    const partes = numeroExpediente.match(/^(\d+)-(\d{4})\/([\p{L}\d\s\-ÁÉÍÓÚáéíóúÑñ]+)$/u);

    console.log("numeroExpediente: ", partes);


    if (!partes) return '';
    switch (parte) {
      case 'numero': return partes[1];
      case 'anio': return partes[2];
      case 'codigo': return partes[3];
      default: return '';
    }
  }
  private patchFormExpediente(): void {

    console.log("Expediente numero: ", this.extraerParte(this.expedienteSeleccionado.numero_expediente, 'numero'));

    this.formExpediente.patchValue({
      titulo: this.expedienteSeleccionado.titulo || '',
      descripcion: this.expedienteSeleccionado.descripcion || '',
      tipo: this.expedienteSeleccionado.tipo || '',
      estado: this.expedienteSeleccionado.estado || '',
      estado_procesal: this.expedienteSeleccionado.estado_procesal || '',
      numero: this.extraerParte(this.expedienteSeleccionado.numero_expediente, 'numero'),
      anio: this.extraerParte(this.expedienteSeleccionado.numero_expediente, 'anio'),
      codigo: this.extraerParte(this.expedienteSeleccionado.numero_expediente, 'codigo'),
      fecha_inicio: this.formatearFecha(this.expedienteSeleccionado.fecha_inicio),
      fecha_laudo: this.formatearFecha(this.expedienteSeleccionado.fecha_laudo),
      fecha_resolucion: this.formatearFecha(this.expedienteSeleccionado.fecha_resolucion),
    });
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
      estado: [''],
      estado_procesal: [''],
      numero: ['', Validators.required,],
      anio: ['', Validators.required],
      codigo: ['', Validators.required],
      fecha_inicio: [''],
      fecha_laudo: [''],
      fecha_resolucion: [''],
    });
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
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
      estado: data.estado,
      estado_procesal: data.estado_procesal,
      numero_expediente: numeroExpediente,
      codigo: data.codigo,
      fecha_inicio: data.fecha_inicio,
      fecha_laudo: data.fecha_laudo,
      fecha_resolucion: data.fecha_resolucion,
      secretaria_id: this.secretariaId,
    };

    const peticion = this.modoEdicion && this.expedienteSeleccionado?.id_expediente
      ? this.expedientesService.actualizarExpediente(this.expedienteSeleccionado.id_expediente, expedienteData)
      : this.expedientesService.crearExpediente(expedienteData);

    peticion.subscribe({
      next: (resp) => {
        this.cargando = false;
        this.mensajeExito = this.modoEdicion
          ? 'Expediente actualizado correctamente.'
          : 'Expediente creado exitosamente.';
        this.expedienteCreado.emit();
        setTimeout(() => this.cerrarModal(), 1000);
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error en operación de expediente:', err);
        this.mensajeError = err.error?.message || 'Error en la operación.';
      },
    });

  }

  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();
    this.formExpediente.reset();
  }

  get f() {
    return this.formExpediente.controls;
  }


}
