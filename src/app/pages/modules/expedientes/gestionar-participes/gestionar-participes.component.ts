import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormArray } from '@angular/forms';
import { forkJoin } from 'rxjs';
import iziToast from 'izitoast';

// // Directives
// import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';


// Services
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { DesignacionService, IAsignarArbitrosRequest } from 'src/app/services/designacion.service';
import { ParticipeService } from 'src/app/services/admin/participes.service';
import { ArbitrosService } from 'src/app/services/admin/arbitros.service';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioSecretaria } from 'src/app/interfaces/users/secretariaUser';
import Swal from 'sweetalert2';

@Component({
  selector: 'gestionar-participes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestionar-participes.component.html',
  styles: ``
})
export class GestionarParticipesComponent implements OnInit {

  @Input() mostrarModal = false;
  // @Input() modoEdicion = false;
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


  // formDemandante!: FormGroup;
  // formDemandado!: FormGroup;

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
  expediente: any = null;
  participes: any[] = [];
  isEntidad: boolean = false;

  demandantesDisponibles: any[] = [];
  demandantesSeleccionados: any[] = [];

  demandadosDisponibles: any[] = [];
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

  // designacionActual: any = null;
  // mensaje: string = '';

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

    // this.expedienteId = this.expedienteSeleccionado.id_expediente;
    this.expediente = this.expedienteSeleccionado;

    // console.log("EXPEDIENTE SELECCIONADO: ", this.expedienteSeleccionado)

    this.cargarDatosIniciales();
    this.setModalWidth('xl');

    this.initForm();

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
    // if (this.currentStep < this.totalSteps) {
    //   this.currentStep++;
    // }
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

  // ============================================================
  //  CARGAR EXPEDIENTE + PARTICIPES + ARBITROS
  // ============================================================
  cargarDatosIniciales() {
    this.loading = true;

    forkJoin({
      // participes: this.expedientesService.listarParticipantes(this.expedienteId),
      participes: this.participesService.listaParticipes(),
      arbitros: this.arbitroService.getArbitros()
    }).subscribe({
      next: resp => {
        // Obtener array real desde "data" si tu backend lo envía así
        // this.participes = resp.participes;
        const listaParticipes = resp.participes.data || resp.participes;

        // Filtrar y crear listas separadas
        this.demandantesDisponibles = listaParticipes.filter((p: { id_expediente: null; rol_participe: string; }) =>
          p.id_expediente === null && p.rol_participe === 'Demandante'
        );

        this.demandadosDisponibles = listaParticipes.filter((p: { id_expediente: null; rol_participe: string; }) =>
          p.id_expediente === null && p.rol_participe === 'Demandado'
        );

        // Guardar arbitros
        this.arbitrosDisponibles = resp.arbitros;

        // console.log("DEMANDANTES DISPONIBLES:", this.demandantesDisponibles);
        // console.log("DEMANDADOS DISPONIBLES:", this.demandadosDisponibles);
        // console.log("ARBITROS DISPONIBLES:", this.arbitrosDisponibles);

        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // seleccionar/deseleccionar árbitro
  toggleArbitro(id: number) {
    const idx = this.arbitrosSeleccionados.indexOf(id);
    if (idx >= 0) this.arbitrosSeleccionados.splice(idx, 1);
    else this.arbitrosSeleccionados.push(id);
  }



  agregarDemandante(p: any) {
    // 1. Quitar de disponibles
    this.demandantesDisponibles = this.demandantesDisponibles.filter(
      d => d.id_participe !== p.id_participe
    );

    // 2. Evitar duplicados visuales
    const existeUI = this.demandantesSeleccionados.some(
      d => d.id_participe === p.id_participe
    );

    if (!existeUI) {
      this.demandantesSeleccionados = [
        ...this.demandantesSeleccionados,
        { ...p }
      ];

      // 3. Agregar al FormArray
      this.demandantesFA.push(
        this.fb.group({
          participe_id: [p.id_participe, Validators.required],
          rol: [p.rol_participe, Validators.required],
          documento: [p.usuario?.documento_identidad]
        })
      );
    }

    // 4. Marcar como tocado para validación
    this.demandantesFA.markAsTouched();
  }

  quitarDemandante(p: any) {
    // 1. Índice en seleccionados
    const index = this.demandantesSeleccionados.findIndex(
      d => d.id_participe === p.id_participe
    );

    if (index === -1) return;

    // 2. Quitar del FormArray (MISMO índice)
    this.demandantesFA.removeAt(index);

    // 3. Quitar del array visual
    this.demandantesSeleccionados = this.demandantesSeleccionados.filter(
      d => d.id_participe !== p.id_participe
    );

    // 4. Evitar duplicados en disponibles
    const existeDisponible = this.demandantesDisponibles.some(
      d => d.id_participe === p.id_participe
    );

    if (!existeDisponible) {
      this.demandantesDisponibles = [
        ...this.demandantesDisponibles,
        { ...p }
      ];
    }

    // 5. Validación reactiva
    this.demandantesFA.markAsTouched();
  }


  agregarDemandando(p: any) {
    this.demandadosDisponibles = this.demandadosDisponibles.filter(
      d => d.id_participe !== p.id_participe
    );

    const existeUI = this.demandadosSeleccionados.some(
      d => d.id_participe === p.id_participe
    );

    if (!existeUI) {
      this.demandadosSeleccionados = [
        ...this.demandadosSeleccionados,
        { ...p }
      ];

      this.demandadosFA.push(
        this.fb.group({
          participe_id: [p.id_participe, Validators.required],
          rol: [p.rol_participe, Validators.required],
          documento: [p.usuario?.documento_identidad]
        })
      );
    }

    this.demandadosFA.markAsTouched();
  }

  quitarDemandando(p: any) {
    const index = this.demandadosSeleccionados.findIndex(
      d => d.id_participe === p.id_participe
    );

    if (index === -1) return;

    this.demandadosFA.removeAt(index);

    this.demandadosSeleccionados = this.demandadosSeleccionados.filter(
      d => d.id_participe !== p.id_participe
    );

    const existeDisponible = this.demandadosDisponibles.some(
      d => d.id_participe === p.id_participe
    );

    if (!existeDisponible) {
      this.demandadosDisponibles = [
        ...this.demandadosDisponibles,
        { ...p }
      ];
    }

    this.demandadosFA.markAsTouched();
  }


  // ============================================================
  //  SELECTORES DE ARBITROS PARA LOS ROLES
  // ============================================================
  // actualizarTablaArbitros() {
  //   this.arbitrosTribunal = [];

  //   if (this.arbitroDemandante) {
  //     const a = this.arbitrosDisponibles.find(x => x.id_arbitro === this.arbitroDemandante);
  //     if (a) {
  //       this.arbitrosTribunal.push({
  //         rol: 'Parte A',
  //         nombreCompleto: `${a.usuario.nombre} ${a.usuario.apellidos}`
  //       });
  //     }
  //   }

  //   if (this.arbitroDemandado) {
  //     const a = this.arbitrosDisponibles.find(x => x.id_arbitro === this.arbitroDemandado);
  //     if (a) {
  //       this.arbitrosTribunal.push({
  //         rol: 'Parte B',
  //         nombreCompleto: `${a.usuario.nombre} ${a.usuario.apellidos}`
  //       });
  //     }
  //   }

  //   if (this.arbitroInstitucion) {
  //     const a = this.arbitrosDisponibles.find(x => x.id_arbitro === this.arbitroInstitucion);
  //     if (a) {
  //       this.arbitrosTribunal.push({
  //         rol: 'Institucional',
  //         nombreCompleto: `${a.usuario.nombre} ${a.usuario.apellidos}`
  //       });
  //     }
  //   }
  // }

  seleccionarArbitroInstitucional(rol: 'PARTE_A' | 'PARTE_B' | 'INSTITUCIONAL', idArbitro: number) {
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
        estado: 'PENDIENTE'
      })
    );

    // Actualizar tabla visual
    // this.actualizarTablaVisual();
  }

  actualizarTablaVisual() {
    this.arbitrosTribunal = this.arbitrosFA.value.map((a: any) => {
      const info = this.arbitrosDisponibles.find(x => x.id_arbitro === a.arbitro_id);

      return {
        arbitro_id: a.arbitro_id,
        rol: a.rol,
        nombreCompleto: `${info?.usuario.nombre} ${info?.usuario.apellidos}`,
        estado: a.estado
      };
    });
  }

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
  }


  getParticipesSeleccionados() {
    return this.participes.filter(p => p.seleccionado);
  }

  getArbitrosSeleccionados() {
    return this.arbitrosDisponibles.filter(a => a.seleccionado);
  }

  asignarAlExpediente() {
    // const participes = this.getParticipesSeleccionados();
    // const arbitros = this.getArbitrosSeleccionados();

    if (!this.expedienteSeleccionado) return;

    const payload: any = {
      // expediente_id: this.expedienteSeleccionado.id_expediente,
      tipo_arbitraje: this.expedienteSeleccionado.tipo,
      demandantes: this.demandantesFA.value.map((d: any) => ({
        participe_id: d.participe_id
      })),
      demandados: this.demandadosFA.value.map((d: any) => ({
        participe_id: d.participe_id
      })),
      arbitros: []
    };

    // ==================================================
    // ARBITRAJE DE EMERGENCIA
    // ==================================================
    if (this.expedienteSeleccionado.tipo === 'Arbitraje de Emergencia') {
      if (!this.arbitroEmergenciaSeleccionado) {
        Swal.fire('Falta árbitro', 'Seleccione un árbitro de emergencia', 'warning');
        return;
      }

      payload.arbitros.push({
        arbitro_id: this.arbitroEmergenciaSeleccionado.id_arbitro,
        rol: 'EMERGENCIA',
        estado: this.arbitroEmergenciaSeleccionado.estado
      });
    }

    // ==================================================
    // ARBITRAJE INSTITUCIONAL (TRIBUNAL)
    // ==================================================
    if (
      this.expedienteSeleccionado.tipo === 'Arbitraje Institucional' ||
      this.expedienteSeleccionado.tipo === 'Arbitraje Ad Hoc'
    ) {
      if (this.arbitrosFA.length === 0) {
        Swal.fire('Faltan árbitros', 'Debe asignar árbitros', 'warning');
        return;
      }

      payload.arbitros = this.arbitrosFA.value.map((a: any) => ({
        arbitro_id: a.arbitro_id,
        rol: a.rol,
        estado: a.estado
      }));
    }


    // ==================================================
    // ARBITRAJE AD HOC (flexible)
    // ==================================================
    if (this.expedienteSeleccionado.tipo === 'Arbitraje Ad Hoc') {
      this.arbitrosTribunal.forEach(a => {
        payload.arbitros.push({
          arbitro_id: a.arbitro_id,
          rol: 'AD_HOC',
          nombreCompleto: a.nombreCompleto
        });
      });
    }

    // Asignar expediente

    const idExpediente = this.expedienteSeleccionado.id_expediente;

    console.log('PAYLOAD FINAL:', payload);
    console.log('expedienteId:', idExpediente);


    this.expedientesService.asignarParticipesYDesignacion(idExpediente, payload).subscribe({
      next: (res) => {
        Swal.fire('Éxito', 'Participes y árbitros asignados correctamente', 'success');
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo asignar participantes o árbitros', 'error');
      }
    });

  }
}
