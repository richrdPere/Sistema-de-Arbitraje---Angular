import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormArray } from '@angular/forms';
import { forkJoin } from 'rxjs';
import iziToast from 'izitoast';

// Services
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { DesignacionService, IAsignarArbitrosRequest } from 'src/app/services/designacion.service';
import { ParticipeService } from 'src/app/services/admin/participes.service';
import { ArbitrosService } from 'src/app/services/admin/arbitros.service';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioSecretaria } from 'src/app/interfaces/users/secretariaUser';

@Component({
  selector: 'app-gestionar-participes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestionar-participes.component.html',
  styles: ``
})
export class GestionarParticipesComponent implements OnInit {



  // -----------------------------
  // Variables
  // -----------------------------

  form!: FormGroup;

  tipos = [
    { value: 'individual', label: 'Árbitro único' },
    { value: 'tribunal', label: 'Tribunal arbitral' },
    { value: 'aleatoria', label: 'Designación aleatoria' }
  ];

  rolesTribunal = ['parteA', 'parteB', 'institucion'];

  loading = false;


  rol: string = '';
  nombre: string = '';
  id: number = 0;
  usuario: UsuarioSecretaria = inject(AuthService).getUser() as UsuarioSecretaria;
  expedienteId!: number;
  expediente: any = null;
  participes: any[] = [];

  arbitrosDisponibles: any[] = [];
  arbitrosSeleccionados: number[] = [];
  arbitros: any[] = [];


  arbSolicitante!: number;
  arbRequerido!: number;
  arbInstitucion!: number;

  // Roles según el tipo
  tipoSeleccionado: 'individual' | 'tribunal' | 'aleatoria' | '' = '';

  arbitroUnico: number | null = null;
  arbitroDemandante: number | null = null;
  arbitroDemandado: number | null = null;
  arbitroInstitucion: number | null = null;

  designacionActual: any = null;
  mensaje: string = '';

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

    this.expedienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDatosIniciales();
    this.initForm();

    this.form.get('tipo_designacion')?.valueChanges.subscribe(tipo => {

    });

  }

  initForm() {
    this.form = this.fb.group({
      expediente_id: ['', Validators.required],
      tipo_designacion: ['', Validators.required],
      arbitros: this.fb.array([])
    });
  }


  // ============================================================
  //  CARGAR EXPEDIENTE + PARTICIPES + ARBITROS
  // ============================================================
  cargarDatosIniciales() {
    this.loading = true;

    forkJoin({
      expediente: this.expedientesService.obtenerExpedientePorId(this.expedienteId),
      participes: this.expedientesService.listarParticipantes(this.expedienteId),
      arbitros: this.arbitroService.getArbitros()
    }).subscribe({
      next: resp => {
        this.expediente = resp.expediente;
        this.participes = resp.participes;
        this.arbitrosDisponibles = resp.arbitros;
        console.log("ARBITROS DISPONIBLES: ", this.arbitrosDisponibles);
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



  // ============================================================
  //  SELECTORES DE ARBITROS PARA LOS ROLES
  // ============================================================
  selectArbitroUnico(id: number) {
    this.arbitroUnico = id;
  }

  selectArbitroDemandante(id: number) {
    this.arbitroDemandante = id;
  }

  selectArbitroDemandado(id: number) {
    this.arbitroDemandado = id;
  }

  selectArbitroInstitucion(id: number) {
    this.arbitroInstitucion = id;
  }

  // ============================================================
  //  GUARDAR DESIGNACION
  // ============================================================
  guardarDesignacion() {

    if (!this.tipoSeleccionado) {
      return iziToast.warning({
        title: "Aviso",
        message: "Debe seleccionar un tipo de designación."
      });
    }

    const payload: any = {
      expediente_id: this.expedienteId,
      adjudicador_id: this.usuario.id,
      tipo_designacion: this.tipoSeleccionado,
      usuario: this.usuario,
      arbitros: this.arbitros

    };

    // -------------------------
    //  INDIVIDUAL
    // -------------------------
    if (this.tipoSeleccionado === 'individual') {

      if (!this.arbitroUnico) {
        return iziToast.error({
          title: "Error",
          message: "Debe seleccionar un árbitro único."
        });
      }

      payload.arbitros.push({
        arbitro_id: this.arbitroUnico,
        rol: 'arbitro'
      });

    }

    console.log('ENVIANDO: ', payload);

    // -------------------------
    //  TRIBUNAL
    // -------------------------
    if (this.tipoSeleccionado === 'tribunal') {

      if (!this.arbSolicitante || !this.arbRequerido || !this.arbInstitucion) {
        return iziToast.error({
          title: "Error",
          message: "Debe seleccionar los 3 árbitros del tribunal."
        });
      }

      payload.arbitro_ids = [
        this.arbSolicitante,
        this.arbRequerido,
        this.arbInstitucion
      ];
    }

    // -------------------------
    //  ALEATORIA
    // -------------------------
    if (this.tipoSeleccionado === 'aleatoria') {
      payload.cantidad = 1; // o 3 si quieres tribunal aleatorio
    }

    // -------------------------
    //  ENVIAR
    // -------------------------
    this.loading = true;

    this.designacionService.crearDesignacion(payload).subscribe({
      next: resp => {
        this.designacionActual = resp.designacion;

        console.log("ENVIANDO: ", this.designacionActual)
        this.loading = false;

        iziToast.success({
          title: "Éxito",
          message: "Designación registrada correctamente."
        });
      },
      error: err => {
        this.loading = false;

        iziToast.error({
          title: "Error",
          message: err.error?.message || "No se pudo registrar la designación."
        });
      }
    });
  }


  // ======================================================
  // ============= ASIGNAR ÁRBITROS =======================
  // ======================================================
  asignarArbitros() {
    const payload: IAsignarArbitrosRequest = {
      arbitro_ids: this.arbitrosSeleccionados
    };

    this.designacionService.asignarArbitros(this.expedienteId, payload)
      .subscribe({
        next: () => {
          alert('Árbitros asignados correctamente');
        },
        error: (err) => console.error(err)
      });
  }
}
