import { CommonModule } from '@angular/common';
import {
  Component, Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'instalacion-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './instalacion-form.component.html',
  styles: ``
})
export class InstalacionFormComponent implements OnInit, OnChanges {



  /** Si viene definido → editar | si es null → crear */
  @Input() acta: any = null;
  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() actaSeleccionado: any = null;

  @Output() modalCerrado = new EventEmitter<any>();
  @Output() expedienteCreado = new EventEmitter<void>();

  formActaInstalacion!: FormGroup;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';

  isEditMode = false;

  // Step
  currentStep = 1;
  totalSteps = 5;

  // Data
  actaId: number | null = null;
  expedienteId!: number;

  // normasLegales: any[] = [];
  nuevaNorma: string = '';


  // Catálogos (vendrán del backend)
  arbitrosDisponibles: any[] = [];
  secretarias: any[] = [];
  regimenes?: any[];

  constructor(
    private fb: FormBuilder,


  ) {
    // this.buildForm();
  }

  ngOnInit(): void {
    this.initForm();

  }


  ngOnChanges(changes: SimpleChanges): void {
    // Detecta cuando cambian los inputs
    if ((changes['actaSeleccionado'] || changes['mostrarModal']) && this.modoEdicion && this.actaSeleccionado) {
      this.patchFormActa();
    }
  }

  private patchFormActa(): void {
    this.formActaInstalacion.patchValue({
      titulo: this.actaSeleccionado.titulo || '',
      descripcion: this.actaSeleccionado.descripcion || '',

    });
  }

  private initForm() {
    this.formActaInstalacion = this.fb.group({
      // IDENTIFICACIÓN
      expedienteId: ['', Validators.required],
      secretariaId: ['', Validators.required],

      // PASO 1: TRIBUNAL ARBITRAL
      tribunal_tipo: ['', Validators.required], // 'Único' o 'Colegiado'
      numero_arbitros: ['', Validators.required], // 1, 3, 5...
      arbitros: this.fb.array([], Validators.required), // Array de árbitros
      presidente_arbitral: ['', Validators.required], // Árbitro presidente
      // suplentes: this.fb.array([]), // Árbitros suplentes

      // ASPECTOS LEGALES
      clase_arbitraje: ['', Validators.required],  // 'De Derecho' o 'De Conciencia'
      institucion_arbitral: [''],  // Si se encomienda a una institución (Art. 6 LGA)
      normas_procesales: this.fb.array([], Validators.required),
      // recurso_apelacion: [false], // Si se pacta recurso de apelación (Art. 33 LGA)
      // segunda_instancia_arbitral: [false],  // Si la apelación es ante segunda instancia arbitral

      // PASO 2: FECHAS Y LUGAR
      fecha_convocatoria: ['', Validators.required],
      fecha_instalacion: ['', Validators.required],
      hora_instalacion: ['', Validators.required],
      modalidad: ['', Validators.required],
      lugar: ['', Validators.required],
      link: [''],

      // PLAZOS
      plazo_laudo: ['', Validators.required], // Días para emitir laudo (Art. 49)
      etapa_probatoria_inicio: [''], // Fecha inicio de pruebas
      etapa_probatoria_fin: [''], // Fecha fin de pruebas

      // PARTES
      // representante_demandante: ['', Validators.required],
      // representante_demandado: ['', Validators.required],
      // poderes_especiales: [false], // Si los representantes tienen poderes especiales (Art. 23 LGA)

      // ASPECTOS ECONÓMIC// OS
      // honorarios_arbitros: [''],
      // forma_pago_honorarios: [''], // 'Por partes iguales', 'por la vencida', etc.
      // costas_procesales: [''],

      // MEDIDAS CAUTELARES
      // medidas_cautelares_solicitadas: [false],
      // medidas_cautelares_concedidas: [false],
      // contracautela: [''], // Si se exige contracautela (Art. 81 LGA)

      // COMUNICACIONES
      // email_notificaciones: ['', [Validators.email]],
      // domicilio_procesal: ['', Validators.required],
      // medio_notificacion: ['', Validators.required],

      // DOCUMENTACIÓN Y SEGUIMIENTO
      // cronograma_inicial: ['', Validators.required],
      // observaciones: [''],
      estado: ['INSTALADO', Validators.required] // 'INSTALADO', 'EN PROCESO', 'FINALIZADO'
    });
  }

  nextStep() {
    // if (!this.isStepValid(this.currentStep)) {
    //   this.formActaInstalacion.markAllAsTouched();
    //   return;
    // }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }


  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return (
          !!this.formActaInstalacion.get('expedienteId')?.valid &&
          !!this.formActaInstalacion.get('secretariaId')?.valid &&
          !!this.formActaInstalacion.get('tribunal_tipo')?.valid &&
          !!this.formActaInstalacion.get('numero_arbitros')?.valid
        );

      case 2:
        return (
          !!this.formActaInstalacion.get('clase_arbitraje')?.valid &&
          !!this.formActaInstalacion.get('normas_procesales')?.valid
        );

      case 3:
        return (
          !!this.formActaInstalacion.get('fecha_instalacion')?.valid &&
          !!this.formActaInstalacion.get('modalidad')?.valid &&
          !!this.formActaInstalacion.get('plazo_laudo')?.valid
        );

      case 4:
        return (
          !!this.formActaInstalacion.get('representante_demandante')?.valid &&
          !!this.formActaInstalacion.get('representante_demandado')?.valid
        );

      case 5:
        return this.formActaInstalacion.valid;

      default:
        return false;
    }
  }



  goToStep(step: number) {
    if (step <= this.currentStep) {
      this.currentStep = step;
    }
  }
  crearOEditarActaInstalacion() {
    if (this.formActaInstalacion.invalid) {
      this.formActaInstalacion.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.formActaInstalacion.value,
      id: this.acta?.id ?? null,
    };


  }

  // NORMAS LEGALES
  agregarNorma() {
    if (!this.nuevaNorma.trim()) return;

    this.normasLegalesArray.push(
      this.fb.control(this.nuevaNorma.trim(), Validators.required)
    );

    this.nuevaNorma = '';
  }

  eliminarNorma(index: number) {
    this.normasLegalesArray.removeAt(index);
  }

  get normasLegalesArray(): FormArray {
    return this.formActaInstalacion.get('normas_procesales') as FormArray;
  }


  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();
    this.formActaInstalacion.reset();
  }
}
