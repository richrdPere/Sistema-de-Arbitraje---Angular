import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

// Services
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { DesignacionService } from 'src/app/services/designacion.service';
import { ParticipeService } from 'src/app/services/admin/participes.service';
import { ArbitrosService } from 'src/app/services/admin/arbitros.service';
import iziToast from 'izitoast';


@Component({
  selector: 'app-gestionar-participes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestionar-participes.component.html',
})
export class GestionarParticipesComponent implements OnInit {

  // -----------------------------
  // Inyecciones
  // -----------------------------
  route = inject(ActivatedRoute);
  router = inject(Router);

  constructor(
    private expedientesService: ExpedientesService,
    private participesService: ParticipeService,
    private arbitroService: ArbitrosService,
    private designacionService: DesignacionService
  ) { }

  // -----------------------------
  // Variables
  // -----------------------------
  expedienteId!: number;
  expediente: any = null;
  participes: any[] = [];
  arbitrosDisponibles: any[] = [];
  arbitrosSeleccionados: number[] = [];

  tipoSeleccionado: string = '';

  arbSolicitante!: number;
  arbRequerido!: number;
  arbInstitucion!: number;

  // Roles según el tipo
  arbitroUnico: number | null = null;
  arbitroDemandante: number | null = null;
  arbitroDemandado: number | null = null;
  arbitroInstitucion: number | null = null;

  designacionActual: any = null;
  loading = false;
  mensaje: string = '';

  tiposDesignacion = [
    { value: 'individual', label: 'Árbitro único' },
    { value: 'tribunal', label: 'Tribunal arbitral (3 árbitros)' },
    { value: 'aleatoria', label: 'Designación aleatoria' }
  ];

  // ============================================================
  //  INIT
  // ============================================================
  ngOnInit() {
    this.expedienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDatosIniciales();
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
      tipo_designacion: this.tipoSeleccionado,
      adjudicador_id: Number(localStorage.getItem('usuario_id')),
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

      payload.arbitro_ids = [this.arbitroUnico];
    }

    // -------------------------
    //  TRIBUNAL
    // -------------------------
    if (this.tipoSeleccionado === 'tribunal') {

      if (!this.arbitroDemandante || !this.arbitroDemandado || !this.arbitroInstitucion) {
        return iziToast.error({
          title: "Error",
          message: "Debe seleccionar los 3 árbitros del tribunal."
        });
      }

      payload.arbitro_ids = [
        this.arbitroDemandante,
        this.arbitroDemandado,
        this.arbitroInstitucion
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
}


// import { Component, OnInit, inject } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { forkJoin } from 'rxjs';

// // Services
// import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
// import { DesignacionService } from 'src/app/services/designacion.service';
// import { ParticipeService } from 'src/app/services/admin/participes.service';
// import { ArbitrosService } from 'src/app/services/admin/arbitros.service';
// import iziToast from 'izitoast';


// @Component({
//   selector: 'app-gestionar-participes',
//   imports: [CommonModule, FormsModule, ReactiveFormsModule],
//   templateUrl: './gestionar-participes.component.html',
// })
// export class GestionarParticipesComponent implements OnInit {

//   // -----------------------------
//   // Inyecciones
//   // -----------------------------
//   route = inject(ActivatedRoute);
//   router = inject(Router);

//   expedienteId!: number;
//   expediente: any = null;
//   participes: any[] = [];

//   // Designación actual
//   designacionActual: any = null;

//   // Tipos de designación
//   tiposDesignacion = [
//     { value: 'individual', label: 'Árbitro único' },
//     { value: 'tribunal', label: 'Tribunal arbitral (3 árbitros)' },
//     { value: 'aleatoria', label: 'Designación aleatoria' },
//   ];

//   tipoSeleccionado: string = '';
//   arbitrosDisponibles: any[] = [];
//   arbitrosSeleccionados: number[] = [];

//   // Árbitros seleccionados
//   arbitroUnico: number | null = null;
//   arbitroDemandante: number | null = null;
//   arbitroDemandado: number | null = null;
//   arbitroInstitucion: number | null = null;

//   loading = false;
//   mensaje: string = '';

//   constructor(
//     private expedientesService: ExpedientesService,
//     private participesService: ParticipeService,
//     private arbitroService: ArbitrosService,
//     private designacionService: DesignacionService
//   ) { }

//   ngOnInit() {
//     // this.expedienteId = Number(localStorage.getItem('expediente_actual'));
//     this.expedienteId = Number(this.route.snapshot.paramMap.get('id'));
//     this.cargarDatosIniciales();
//   }

//   // seleccionar/deseleccionar árbitro
//   toggleArbitro(id: number) {
//     const idx = this.arbitrosSeleccionados.indexOf(id);
//     if (idx >= 0) this.arbitrosSeleccionados.splice(idx, 1);
//     else this.arbitrosSeleccionados.push(id);
//   }

//   // Devuelve el id numérico correcto del árbitro (compatibilidad)
//   private getArbitroId(arb: any): number {
//     // la API devuelve { id_arbitro, usuario: { nombre... } } según tu modelo
//     return arb?.id_arbitro ?? arb?.id ?? null;
//   }

//   selectArbitroParaRol(rol: 'demandante' | 'demandado' | 'institucion', id: number) {
//     if (rol === 'demandante') this.arbitroDemandante = id;
//     if (rol === 'demandado') this.arbitroDemandado = id;
//     if (rol === 'institucion') this.arbitroInstitucion = id;

//     // mantener array auxiliar (opcional)
//     const toInclude = [this.arbitroDemandante, this.arbitroDemandado, this.arbitroInstitucion].filter(Boolean) as number[];
//     this.arbitrosSeleccionados = Array.from(new Set(toInclude));
//   }

//   /** ============================
//    *  Cargar expediente + participes
//    *  ============================ */
//   cargarDatosIniciales() {
//     this.loading = true;

//     forkJoin({
//       expediente: this.expedientesService.obtenerExpedientePorId(this.expedienteId),
//       participes: this.expedientesService.listarParticipantes(this.expedienteId),
//       arbitros: this.arbitroService.getArbitros()
//     }).subscribe({
//       next: (resp) => {
//         this.expediente = resp.expediente;
//         this.participes = resp.participes;
//         this.arbitrosDisponibles = resp.arbitros;
//         this.loading = false;   // <-- AHORA SÍ SE LIBERA

//         // console.log("Expediente:", this.expediente);
//         // console.log("Participes:", this.participes);
//         // console.log("Árbitros disponibles:", this.arbitrosDisponibles);
//       },
//       error: (err) => {
//         console.error("Error cargando datos", err);
//         this.loading = false; // <-- TAMBIÉN EN ERROR
//       }
//     });
//   }

//   /** ============================
//    *  Enviar designación al backend
//    *  ============================ */
//   guardarDesignacion() {
//     if (!this.tipoSeleccionado) {
//       return iziToast.warning({ title: 'Aviso', message: 'Debe seleccionar un tipo de designación.' });
//     }

//     const payload: any = {
//       expediente_id: this.expedienteId,
//       tipo_designacion: this.tipoSeleccionado,
//       adjudicador_id: Number(localStorage.getItem('usuario_id')),
//     };

//     console.log("payload:", payload);

//     /** ============================
//      *  INDIVIDUAL
//      *  ============================ */
//     if (this.tipoSeleccionado === 'individual') {
//       if (!this.arbitroUnico) {
//         return iziToast.error({ title: 'Error', message: 'Debe seleccionar un árbitro único.' });
//       }

//       payload.arbitro_ids = [this.arbitroUnico];
//     }

//     /** ============================
//      *  TRIBUNAL (3 árbitros)
//      *  ============================ */
//     if (this.tipoSeleccionado === 'tribunal') {
//       if (!this.arbitroDemandante || !this.arbitroDemandado || !this.arbitroInstitucion) {
//         return iziToast.error({
//           title: 'Error',
//           message: 'Debe seleccionar los 3 árbitros del tribunal.'
//         });
//       }

//       payload.arbitro_ids = [
//         this.arbitroDemandante,
//         this.arbitroDemandado,
//         this.arbitroInstitucion
//       ];
//     }

//     /** ============================
//      *  ALEATORIA
//      *  ============================ */
//     if (this.tipoSeleccionado === 'aleatoria') {
//       payload.cantidad = 1; // o 3 si quieres tribunal aleatorio
//     }

//     this.loading = true;

//     this.designacionService.crearDesignacion(payload).subscribe({
//       next: (resp) => {
//         this.mensaje = "Designación registrada correctamente.";
//         this.designacionActual = resp.designacion;
//         this.loading = false;

//         iziToast.success({
//           title: 'Éxito',
//           message: 'Se registró la designación correctamente.'
//         });
//       },
//       error: (err) => {
//         console.error(err);
//         this.mensaje = err.error?.message || "Error al registrar la designación";
//         this.loading = false;

//         iziToast.error({
//           title: 'Error',
//           message: this.mensaje
//         });
//       }
//     });
//   }

//   /** ============================
//    *  Actualizar designación
//    *  ============================ */
//   actualizarEstado(estado: string) {
//     if (!this.designacionActual) return;

//     this.loading = true;

//     this.designacionService.actualizarDesignacion(
//       this.designacionActual.id_designacion,
//       { estado }
//     ).subscribe({
//       next: (resp) => {
//         this.designacionActual = resp.designacion;
//         this.loading = false;
//       },
//       error: () => {
//         this.loading = false;
//       }
//     });
//   }


//   asignarArbitros() {
//     // if (this.arbitrosSeleccionados.length === 0) {
//     //   return iziToast.warning({ title: 'Aviso', message: 'Debe seleccionar al menos un árbitro.' });
//     // }

//     // const body = {
//     //   expediente_id: this.expedienteId,
//     //   arbitros: this.arbitrosSeleccionados
//     // };

//   }

// }
