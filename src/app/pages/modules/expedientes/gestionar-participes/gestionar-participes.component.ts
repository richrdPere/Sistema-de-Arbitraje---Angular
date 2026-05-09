import { Component, EventEmitter, Input, OnChanges, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormArray } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';

// Services
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { DesignacionService, IAsignarArbitrosRequest } from 'src/app/services/designacion.service';
import { ParticipeService } from 'src/app/services/admin/participes.service';
import { ArbitrosService } from 'src/app/services/admin/arbitros.service';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioSecretaria } from 'src/app/interfaces/users/secretariaUser';
import Swal from 'sweetalert2';

// Components
import { StepDemandantesComponent } from "./step-demandantes/step-demandantes.component";

@Component({
  selector: 'gestionar-participes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StepDemandantesComponent],
  templateUrl: './gestionar-participes.component.html',
  styles: ``
})
export class GestionarParticipesComponent implements OnInit, OnChanges {

  @Input() mostrarModal = false;
  @Input() expedienteSeleccionado: any = null;

  @Output() modalCerrado = new EventEmitter<void>();

  // Step
  currentStep = 1;
  totalSteps = 3;

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

  // -----------------------------
  // Variables
  // -----------------------------
  formDesginacion!: FormGroup;
  maxDocumentoDemandante = 8; // valor por defecto
  maxDocumentoDemandado = 8;

  arbitrosTribunal: {
    rol: string;
    nombreCompleto: string;
    arbitro_id?: number,

  }[] = [];

  loading = false;


  rol: string = '';
  nombre: string = '';
  id: number = 0;
  usuario: UsuarioSecretaria = inject(AuthService).getUser() as UsuarioSecretaria;
  expedienteId!: number;
  expediente: any;
  participes: any[] = [];
  isEntidad: boolean = false;

  // demandantesDisponibles: any[] = [];
  demandantesSeleccionados: any[] = [];

  // demandadosDisponibles: any[] = [];
  demandadosSeleccionados: any[] = [];

  arbitrosDisponibles: any[] = [];
  arbitrosSeleccionados: number[] = [];

  arbitroEmergenciaSeleccionado: any = null;

  // Roles según el tipo
  tipoSeleccionado: 'individual' | 'tribunal' | 'aleatoria' | '' = '';

  arbitroUnico: number | null = null;
  arbitroDemandante: number | null = null;
  arbitroDemandado: number | null = null;
  arbitroInstitucion: number | null = null;

  tiposDesignacion = [
    { value: 'individual', label: 'Árbitro único' },
    { value: 'tribunal', label: 'Tribunal arbitral (3 árbitros)' },
    { value: 'aleatoria', label: 'Designación aleatoria' }
  ];

  constructor(
    private fb: FormBuilder,
    private designacionService: DesignacionService,
    private expedientesService: ExpedientesService,
    private participesService: ParticipeService,
    private authService: AuthService,
    private arbitroService: ArbitrosService,
    private route: ActivatedRoute,
    public router: Router,
  ) {

  }

  // ============================================================
  //  INIT
  // ============================================================
  ngOnInit() {
    this.setModalWidth('xl');
    this.initForm();
    this.expedienteId = this.expedienteSeleccionado?.id_expediente;
  }

  ngOnChanges() {
    if (this.expedienteSeleccionado) {

      this.expediente = this.expedienteSeleccionado;
      this.expedienteId = this.expedienteSeleccionado?.id_expediente;
      this.cargarDatosIniciales();
      // this.getArbitrosDesignados();
    }
  }

  initForm() {
    this.formDesginacion = this.fb.group({
      demandantes: this.fb.array([]),
      demandados: this.fb.array([]),
      //arbitros: this.fb.array([])
      arbitros: this.fb.group({
        arbitrosTribunal: this.fb.array([], Validators.required)
      })
    });
  }

  // Getter limpio
  get demandantesFA(): FormArray {
    return this.formDesginacion.get('demandantes') as FormArray;
  }

  get demandadosFA(): FormArray {
    return this.formDesginacion.get('demandados') as FormArray;
  }

  get arbitrosFA(): FormArray {
    return this.formDesginacion.get('arbitros.arbitrosTribunal') as FormArray;
  }

  agregarParticipante(p: any, tipo: 'demandante' | 'demandado') {

    const FA = tipo === 'demandante'
      ? this.demandantesFA
      : this.demandadosFA;

    const existe = FA.controls.some(ctrl =>
      ctrl.value.participe_id === p.id_participe
    );

    if (existe) return;

    FA.push(
      this.fb.group({
        participe_id: [p.id_participe, Validators.required],
        rol: [p.rol_participe, Validators.required],
        documento: [p.usuario?.documento_identidad]
      })
    );

    FA.markAsTouched();
    FA.updateValueAndValidity();
  }

  quitarParticipante(id: number, tipo: 'demandante' | 'demandado') {

    const FA = tipo === 'demandante'
      ? this.demandantesFA
      : this.demandadosFA;

    const index = FA.controls.findIndex(ctrl =>
      ctrl.value.participe_id === id
    );

    if (index !== -1) {
      FA.removeAt(index);
    }

    FA.updateValueAndValidity();
  }

  get demandantesDisponibles() {

    if (!this.participes) return [];

    const seleccionadosIds = this.demandantesFA.value.map((d: any) => d.participe_id);

    return this.participes.filter((p: any) =>
      p.rol_participe === 'Demandante' &&
      !seleccionadosIds.includes(p.id_participe) && p.id_expediente === null
    );
  }


  get demandadosDisponibles() {

    if (!this.participes) return [];

    const seleccionadosIds = this.demandadosFA.value.map((d: any) => d.participe_id);

    return this.participes.filter((p: any) =>
      p.rol_participe === 'Demandado' &&
      !seleccionadosIds.includes(p.id_participe) && p.id_expediente === null
    );
  }


  limpiarArbitros() {
    this.arbitrosFA.clear();
    this.arbitrosTribunal = [];
    this.arbitroUnico = null;
    this.arbitroDemandante = null;
    this.arbitroDemandado = null;
    this.arbitroInstitucion = null;
  }

  puedeAvanzar(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.demandantesFA.length > 0;

      case 2:
        return this.demandadosFA.length > 0;

      case 3:
        return this.arbitrosFA.length > 0;

      default:
        return false;
    }
  }

  marcarStepComoTouched() {
    switch (this.currentStep) {
      case 1:
        this.demandantesFA.markAllAsTouched();
        break;
      case 2:
        this.demandadosFA.markAllAsTouched();
        break;
      case 3:
        this.arbitrosFA.markAllAsTouched();
        break;
    }
  }

  nextStep() {
    if (!this.puedeAvanzar()) {
      this.marcarStepComoTouched();
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  irAlPaso(step: number) {
    this.currentStep = step;
  }

  // getArbitrosDesignados() {

  //   this.arbitroService.getArbitrosPorExpediente(this.expedienteId).subscribe({


  //     next: resp => {
  //       console.log("RESP ARBITROS EXP:", resp.arbitrosExpediente);

  //       // Obtener arbitros existentes
  //       const arbitrosExp = Array.isArray(resp.arbitrosExpediente)
  //         ? resp.arbitrosExpediente
  //         : resp.arbitrosExpediente?.data || [];

  //       console.log("ARBITROS PROCESADOS:", arbitrosExp);

  //       if (Array.isArray(arbitrosExp) && arbitrosExp.length > 0) {
  //         arbitrosExp.forEach((a: any) => {
  //           this.arbitrosFA.push(
  //             this.fb.group({
  //               arbitro_id: a.arbitro_id,
  //               rol: a.rol,
  //               estado: a.estado,
  //               nombre: a.arbitro?.usuario
  //                 ? `${a.arbitro.usuario.nombre} ${a.arbitro.usuario.apellidos}`
  //                 : 'Sin datos'
  //             })
  //           );
  //         });
  //       }
  //     }


  //   });
  // }

  // ============================================================
  //  CARGAR EXPEDIENTE + PARTICIPES + ARBITROS
  // ============================================================
  cargarDatosIniciales() {
    this.loading = true;

    forkJoin({
      participes: this.participesService.listaParticipes().pipe(catchError(() => of([]))),
      arbitros: this.arbitroService.getArbitros().pipe(catchError(() => of([]))),
      arbitrosExpediente: this.arbitroService.getArbitrosPorExpediente(this.expedienteId)
        .pipe(catchError(() => of([])))
    }).subscribe({
      next: resp => {

        console.log("RESP COMPLETO:", resp);


        // Obtener participes existentes
        const listaParticipes = resp.participes.data || resp.participes;
        this.participes = listaParticipes;

        console.log("Participes: ", this.participes);

        // Limpiar formularios
        this.demandantesFA.clear();
        this.demandadosFA.clear();
        this.arbitrosFA.clear();

        let idsDemandantes: number[] = [];
        let idsDemandados: number[] = [];


        // Obtener arbitros existentes
        const arbitrosExp = Array.isArray(resp.arbitrosExpediente)
          ? resp.arbitrosExpediente
          : resp.arbitrosExpediente?.data || [];

        console.log("ARBITROS PROCESADOS:", arbitrosExp);

        if (Array.isArray(arbitrosExp) && arbitrosExp.length > 0) {
          arbitrosExp.forEach((a: any) => {
            this.arbitrosFA.push(
              this.fb.group({
                arbitro_id: a.arbitro_id,
                rol: a.rol,
                estado: a.estado,
                nombre: a.arbitro?.usuario
                  ? `${a.arbitro.usuario.nombre} ${a.arbitro.usuario.apellidos}`
                  : 'Sin datos'
              })
            );
          });
        }

        console.log("FORM ARRAY ARBITROS:", this.arbitrosFA.value);

        // ================================
        // SEPARAR PARTICIPANTES
        // ================================
        const participantesDelExpediente = listaParticipes.filter((p: any) =>
          p.id_expediente === this.expedienteId
        );

        // ================================
        // SI EXISTE EXPEDIENTE → SELECCIONADOS
        // ================================
        if (this.expedienteId) {

          // DEMANDANTES SELECCIONADOS
          this.demandantesSeleccionados = participantesDelExpediente
            .filter((p: any) => p.rol_participe === 'Demandante');

          // DEMANDADOS SELECCIONADOS
          this.demandadosSeleccionados = participantesDelExpediente
            .filter((p: any) => p.rol_participe === 'Demandado');

          idsDemandantes = this.demandantesSeleccionados.map(p => p.id_participe);
          idsDemandados = this.demandadosSeleccionados.map(p => p.id_participe);

          // IMPORTANTE: poblar FormArray
          this.cargarDemandantesEnFormArray();
          this.cargarDemandadosEnFormArray();
        }

        console.log("demandantesSeleccionados: ", this.demandantesSeleccionados);
        console.log("demandadosSeleccionados: ", this.demandadosSeleccionados);

        // ARBITROS DISPONIBLES
        this.arbitrosDisponibles = resp.arbitros?.data || resp.arbitros || [];
        this.loading = false;
      },
      error: err => {

        this.loading = false;
      }
    });
  }

  // seleccionar/deseleccionar árbitro
  toggleArbitro(arbitro: any) {

    console.log("Arbitro: ", arbitro);

    const index = this.arbitrosFA.controls.findIndex(ctrl =>
      ctrl.value.arbitro_id === arbitro.id_arbitro
    );

    if (index !== -1) {
      this.arbitrosFA.removeAt(index);
    } else {
      this.arbitrosFA.push(
        this.fb.group({
          arbitro_id: arbitro.id_arbitro,
          rol: 'principal',
          estado: 'PENDIENTE',
          nombre: `${arbitro.usuario.nombre} ${arbitro.usuario.apellidos}`
        })
      );
    }

    this.arbitrosFA.updateValueAndValidity();
  }

  private cargarDemandantesEnFormArray() {
    this.demandantesFA.clear();

    this.demandantesSeleccionados.forEach((p: any) => {
      this.demandantesFA.push(
        this.fb.group({
          participe_id: [p.id_participe, Validators.required],
          rol: [p.rol_participe, Validators.required],
          documento: [p.usuario?.documento_identidad]
        })
      );
    });

    this.demandantesFA.markAsTouched();
    this.demandantesFA.updateValueAndValidity();
  }

  private cargarDemandadosEnFormArray() {
    this.demandadosFA.clear();

    this.demandadosSeleccionados.forEach((p: any) => {
      this.demandadosFA.push(
        this.fb.group({
          participe_id: [p.id_participe, Validators.required],
          rol: [p.rol_participe, Validators.required],
          documento: [p.usuario?.documento_identidad]
        })
      );
    });

    this.demandadosFA.markAsTouched();
    this.demandadosFA.updateValueAndValidity();
  }

  // ============================================================
  //  SELECTORES DE ARBITROS PARA LOS ROLES
  // ============================================================
  seleccionarArbitroInstitucional(rol: 'parteA' | 'parteB' | 'institucion', idArbitro: number) {
    const arbitroId = Number(idArbitro);

    const arbitro = this.arbitrosDisponibles.find(
      a => a.id_arbitro === arbitroId
    );
    if (!arbitro) return;

    //  VALIDAR: mismo árbitro en otro rol
    const duplicado = this.arbitrosFA.controls.some(
      c => c.value.arbitro_id === arbitroId && c.value.rol !== rol
    );

    if (duplicado) {
      Swal.fire(
        'Árbitro duplicado',
        'El mismo árbitro no puede tener más de un rol',
        'warning'
      );
      return;
    }

    //  Quitar si ya existe ese rol
    const indexRol = this.arbitrosFA.controls.findIndex(
      c => c.value.rol === rol
    );

    if (indexRol !== -1) {
      this.arbitrosFA.removeAt(indexRol);
    }

    //  Agregar al FormArray
    this.arbitrosFA.push(
      this.fb.group({
        arbitro_id: arbitroId,
        rol,
        nombre: `${arbitro.usuario.nombre} ${arbitro.usuario.apellidos}`,
        estado: 'PENDIENTE'
      })
    );

    console.log("ARBITROS SELECT: ", this.arbitrosFA);

    // Actualizar tabla visual
    // this.actualizarTablaVisual();
  }

  // actualizarTablaVisual() {
  //   this.arbitrosTribunal = this.arbitrosFA.value.map((a: any) => {
  //     const info = this.arbitrosDisponibles.find(x => x.id_arbitro === a.arbitro_id);

  //     return {
  //       arbitro_id: a.arbitro_id,
  //       rol: a.rol,
  //       nombreCompleto: `${info?.usuario.nombre} ${info?.usuario.apellidos}`,
  //       estado: a.estado
  //     };
  //   });
  // }

  getNombreArbitro(id: number): string {
    const a = this.arbitrosDisponibles.find(x => x.id_arbitro === id);
    return a ? `${a.usuario.nombre} ${a.usuario.apellidos}` : '—';
  }

  actualizarEstadoArbitro(ctrl: any, estado: string) {
    ctrl.patchValue({ estado });
  }

  onSeleccionarArbitroEmergencia(idArbitro: number) {
    const arbitro = this.arbitrosDisponibles.find(
      a => a.id_arbitro === Number(idArbitro)
    );

    if (!arbitro) return;

    this.arbitroEmergenciaSeleccionado = {
      ...arbitro,
      estado: 'PENDIENTE' // estado inicial
    };

    //  FORMULARIO (lo que faltaba)
    this.arbitrosFA.clear();
    this.arbitrosFA.push(
      this.fb.group({
        rol: 'Árbitro de Emergencia',
        arbitro_id: arbitro.id_arbitro,
        estado: 'PENDIENTE'
      })
    );
  }


  // ======================================================
  // ============= ASIGNAR ÁRBITROS =======================
  // ======================================================
  cerrarModal() {
    this.mostrarModal = false;
    this.modalCerrado.emit();
    this.formDesginacion.reset();
    this.currentStep = 1;
  }


  getParticipesSeleccionados() {
    return this.participes.filter(p => p.seleccionado);
  }

  getArbitrosSeleccionados() {
    return this.arbitrosDisponibles.filter(a => a.seleccionado);
  }

  asignarAlExpediente() {

    if (!this.expedienteSeleccionado) return;

    // const participes: any[] = [];

    // ===============================
    // DEMANDANTES
    // ===============================
    const payload = {
      expediente_id: this.expedienteSeleccionado.id_expediente,
      tipo_designacion: '',
      participes: [
        ...this.demandantesFA.value.map((d: any) => ({
          participe_id: d.participe_id,
          rol: 'demandante'
        })),
        ...this.demandadosFA.value.map((d: any) => ({
          participe_id: d.participe_id,
          rol: 'demandado'
        }))
      ],
      arbitros: []
    };

    const totalArbitros = this.arbitrosFA.length;

    // ===============================
    // TIPOS
    // ===============================

    switch (this.expedienteSeleccionado.tipo) {

      case 'Arbitraje de Emergencia':
        if (totalArbitros !== 1) {
          Swal.fire('Error', 'Debe seleccionar 1 árbitro', 'warning');
          return;
        }
        payload.tipo_designacion = 'individual';
        break;

      case 'Arbitraje Institucional':
        if (totalArbitros !== 3) {
          Swal.fire('Error', 'Debe asignar 3 árbitros', 'warning');
          return;
        }
        payload.tipo_designacion = 'tribunal';
        break;

      case 'Arbitraje Ad Hoc':
        if (![1, 3].includes(totalArbitros)) {
          Swal.fire('Error', 'Ad Hoc permite 1 o 3 árbitros', 'warning');
          return;
        }
        payload.tipo_designacion = totalArbitros === 1 ? 'individual' : 'tribunal';
        break;
    }

    payload.arbitros = this.arbitrosFA.value.map((a: any) => ({
      arbitro_id: a.arbitro_id,
      rol: a.rol
    }));

    // ===============================
    // LLAMADA AL BACKEND
    // ===============================

    // Asignar expediente
    this.expedientesService.asignarParticipesYDesignacion(payload.expediente_id, payload).subscribe({
      next: (res) => {
        Swal.fire('Éxito', 'Participes y árbitros asignados correctamente', 'success');
      },
      error: (err) => {

        Swal.fire('Error', 'No se pudo asignar participantes o árbitros', 'error');
      }
    });
  }
}
