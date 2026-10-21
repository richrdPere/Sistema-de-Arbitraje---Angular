import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// Services
import { ExpedienteFormService, FormDataExpediente } from 'src/app/pages/features/expedientes/services/expedientes-form.service';

// Components
import { StepPersonaComponent } from './step-persona/step-persona.component';
import { StepExpedienteComponent } from './step-expediente/step-expediente.component';
import { StepResumenExpComponent } from './step-resumen-exp/step-resumen-exp.component';

// ==========================================================
// TIPOS UTILIZADOS POR EL MODAL
// ==========================================================

interface ExpedienteModalPersona {
  tipo?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  dni?: string | null;
  ruc?: string | null;
  razon_social?: string | null;
  nombre_entidad?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  cargo?: string | null;
}

interface ExpedienteModalParticipe {
  rol_participe?: string | null;
  persona?: ExpedienteModalPersona | null;
}

interface ExpedienteModalData {
  id_expediente: number;
  numero_expediente?: string | null;
  codigo?: string | null;
  titulo?: string | null;
  descripcion?: string | null;
  tipo?: string | null;
  fecha_inicio?: string | null;
  fecha_laudo?: string | null;
  fecha_resolucion?: string | null;
  participes?: ExpedienteModalParticipe[] | null;
}

@Component({
  selector: 'expediente-modal',
  standalone: true,
  imports: [
    CommonModule,
    StepPersonaComponent,
    StepExpedienteComponent,
    StepResumenExpComponent,
  ],
  templateUrl: './expediente-modal.component.html',
  styles: ``,
})
export class ExpedienteModalComponent implements OnChanges {
  // ==========================================================
  // INPUTS
  // ==========================================================

  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() expedienteSeleccionado: ExpedienteModalData | null = null;

  // ==========================================================
  // OUTPUTS
  // ==========================================================

  @Output() modalCerrado = new EventEmitter<void>();

  // Se conserva el nombre para mantener la integración
  // con el componente padre. Se emite al crear o editar.
  @Output() expedienteCreado = new EventEmitter<void>();

  // ==========================================================
  // STEPS
  // ==========================================================

  currentStep = 1;
  readonly totalSteps = 3;

  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================

  constructor(
    public readonly expedienteFormService: ExpedienteFormService,
  ) { }

  // ==========================================================
  // CICLO DE VIDA
  // ==========================================================

  ngOnChanges(changes: SimpleChanges): void {
    const cambioVisibilidad = changes['mostrarModal'];

    // También limpia el estado si el padre cierra el modal
    // directamente cambiando el input.
    if (cambioVisibilidad && !this.mostrarModal) {
      this.resetFormulario();
      return;
    }

    if (!this.mostrarModal) {
      return;
    }

    const seAbrio = !!cambioVisibilidad && this.mostrarModal;

    const cambioSeleccion = !!changes['expedienteSeleccionado'];

    const cambioModo = !!changes['modoEdicion'];

    if (seAbrio || cambioSeleccion || cambioModo) {
      this.inicializarFormulario();
    }
  }

  // ==========================================================
  // INICIALIZACIÓN
  // ==========================================================

  private inicializarFormulario(): void {
    this.resetFormulario();

    const expediente = this.expedienteSeleccionado;

    // El padre controla el modo mediante @Input.
    if (!this.modoEdicion) {
      return;
    }

    // Permite que el padre cargue primero el expediente
    // y luego actualice expedienteSeleccionado.
    if (
      !expediente ||
      !Number.isInteger(expediente.id_expediente) ||
      expediente.id_expediente <= 0
    ) {
      // Conserva el modo edición para evitar que los hijos
      // interpreten el formulario como una creación.
      this.expedienteFormService.setModoEdicion(true);
      return;
    }

    this.expedienteFormService.setFullData(
      this.mapToFormData(expediente),
    );

    this.expedienteFormService.setModoEdicion(
      true,
      expediente.id_expediente,
    );
  }

  // ==========================================================
  // MAPPER EXPEDIENTE
  // ==========================================================

  private mapToFormData(
    exp: ExpedienteModalData,
  ): FormDataExpediente {
    const persona = exp.participes?.find(
      (participe) => participe.rol_participe === 'DEMANDANTE',
    )?.persona;

    return {
      persona: {
        tipo: persona?.tipo ?? '',
        nombres: persona?.nombres ?? '',
        apellidos: persona?.apellidos ?? '',
        dni: persona?.dni ?? '',
        ruc: persona?.ruc ?? '',
        razon_social: persona?.razon_social ?? '',
        nombre_entidad: persona?.nombre_entidad ?? '',
        email: persona?.email ?? '',
        telefono: persona?.telefono ?? '',
        direccion: persona?.direccion ?? '',
        cargo: persona?.cargo ?? '',
      },
      expediente: {
        titulo: exp.titulo ?? '',
        descripcion: exp.descripcion ?? '',
        tipo: exp.tipo ?? '',

        // Prioriza el campo real de la API.
        // La extracción solo es un respaldo si no viene codigo.
        codigo:
          exp.codigo ??
          this.extraerParte(
            exp.numero_expediente ?? '',
            'codigo',
          ),

        fecha_inicio: this.formatearFecha(exp.fecha_inicio),
        fecha_laudo: this.formatearFecha(exp.fecha_laudo),
        fecha_resolucion: this.formatearFecha(
          exp.fecha_resolucion,
        ),
      },
    };
  }

  // ==========================================================
  // VALIDACIONES PARA NAVEGACIÓN
  // ==========================================================
  puedeIrAlPaso(step: number): boolean {
    if (
      !Number.isInteger(step) ||
      step < 1 ||
      step > this.totalSteps
    ) {
      return false;
    }

    if (step === 1) {
      return true;
    }

    // Siempre permite regresar para corregir datos.
    if (step < this.currentStep) {
      return true;
    }

    if (this.modoEdicion) {
      const expedienteId =
        this.expedienteFormService.getExpedienteId();

      if (!expedienteId) {
        return false;
      }

      // Persona es informativa en la edición general.
      if (step === 2) {
        return true;
      }

      return this.expedienteCompleto();
    }

    if (step === 2) {
      return this.personaCompleta();
    }

    return (
      this.personaCompleta() &&
      this.expedienteCompleto()
    );
  }

  private personaCompleta(): boolean {
    const persona = this.expedienteFormService.getPersona();

    switch (persona.tipo) {
      case 'NATURAL':
        return (
          this.tieneTexto(persona.nombres) &&
          this.tieneTexto(persona.apellidos) &&
          /^\d{8}$/.test(
            String(persona.dni ?? '').trim(),
          )
        );

      case 'JURIDICA':
        return (
          this.tieneTexto(persona.razon_social) &&
          /^\d{11}$/.test(
            String(persona.ruc ?? '').trim(),
          )
        );

      case 'ENTIDAD_PUBLICA':
        return (
          this.tieneTexto(persona.nombre_entidad) &&
          /^\d{11}$/.test(
            String(persona.ruc ?? '').trim(),
          )
        );

      default:
        return false;
    }
  }

  private expedienteCompleto(): boolean {
    const expediente =
      this.expedienteFormService.getExpediente();

    const tipoValido = expediente.tipo === 'ARBITRAJE_DE_EMERGENCIA' ||
      expediente.tipo === 'ARBITRAJE_AD_HOC' ||
      expediente.tipo === 'ARBITRAJE_INSTITUCIONAL';

    return (
      this.tieneTexto(expediente.titulo) &&
      this.tieneTexto(expediente.codigo) &&
      tipoValido
    );
  }

  private tieneTexto(valor: unknown): valor is string {
    return (
      typeof valor === 'string' &&
      valor.trim().length > 0
    );
  }

  // ==========================================================
  // CONTROL DE STEPS
  // ==========================================================

  // Avanzar
  nextStep(): void {
    this.irAlPaso(this.currentStep + 1);
  }

  // Retroceder
  prevStep(): void {
    this.irAlPaso(this.currentStep - 1);
  }

  // Ir a un paso
  irAlPaso(step: number): void {
    if (!this.puedeIrAlPaso(step)) {
      return;
    }

    this.actualizarPaso(step);
  }

  private actualizarPaso(step: number): void {
    this.currentStep = step;
    this.expedienteFormService.setStep(step);
  }

  // ==========================================================
  // HELPERS
  // ==========================================================

  private formatearFecha(
    fecha: string | null | undefined,
  ): string | null {
    if (!fecha) {
      return null;
    }

    return fecha.split('T')[0];
  }

  private extraerParte(
    numeroExpediente: string,
    parte: 'numero' | 'anio' | 'codigo',
  ): string {
    if (!numeroExpediente) {
      return '';
    }

    const partes = numeroExpediente.match(
      /^(\d+)-(\d{4})\/(.+)$/u,
    );

    if (!partes) {
      return '';
    }

    switch (parte) {
      case 'numero':
        return partes[1];

      case 'anio':
        return partes[2];

      case 'codigo':
        return partes[3].trim();
    }
  }

  // ==========================================================
  // EVENTOS
  // ==========================================================

  onExpedienteGuardado(): void {
    this.expedienteCreado.emit();
  }

  cerrarModal(): void {
    this.resetFormulario();
    this.modalCerrado.emit();
  }

  // ==========================================================
  // RESET
  // ==========================================================

  private resetFormulario(): void {
    this.expedienteFormService.reset();
    this.currentStep = 1;
  }
}
// import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
// import { CommonModule } from '@angular/common';

// // Services
// import { ExpedienteFormService } from 'src/app/pages/features/expedientes/services/expedientes-form.service';

// // Components
// import { StepPersonaComponent } from "./step-persona/step-persona.component";
// import { StepExpedienteComponent } from "./step-expediente/step-expediente.component";
// import { StepResumenExpComponent } from "./step-resumen-exp/step-resumen-exp.component";

// @Component({
//   selector: 'expediente-modal',
//   imports: [CommonModule, StepPersonaComponent, StepExpedienteComponent, StepResumenExpComponent],
//   templateUrl: './expediente-modal.component.html',
//   styles: ``
// })
// export class ExpedienteModalComponent implements OnInit, OnChanges {
//   @Input() mostrarModal = false;
//   @Input() modoEdicion = false;
//   @Input() expedienteSeleccionado: any = null;

//   @Output() modalCerrado = new EventEmitter<void>();
//   @Output() expedienteCreado = new EventEmitter<void>();

//   // Step
//   currentStep: number = 1;
//   totalSteps = 3;


//   constructor(
//     public expedienteFormService: ExpedienteFormService
//   ) { }

//   ngOnInit() {

//   }

//   ngOnChanges(changes: SimpleChanges): void {

//     if (changes['mostrarModal'] && this.mostrarModal) {
//       this.currentStep = 1;
//     }

//     // Detecta cuando cambian los inputs
//     if (changes['expedienteSeleccionado']) {
//       if (this.expedienteSeleccionado) {
//         this.modoEdicion = true;

//         // Mapear data
//         const formData = this.mapToFormData(this.expedienteSeleccionado);

//         // Guardar en el service
//         this.expedienteFormService.setFullData(formData);

//         // Activar modo edición
//         this.expedienteFormService.setModoEdicion(
//           true,
//           this.expedienteSeleccionado.id_expediente
//         );

//         // Opcional: ir al step 1
//         this.currentStep = 1;
//       } else {
//         this.modoEdicion = false;
//         this.expedienteFormService.reset();
//       }
//     }
//   }

//   // ====================================
//   // MAPPER EXPEDIENTE
//   // ====================================
//   private mapToFormData(exp: any) {
//     const persona = exp.participes?.[0]?.persona || {};

//     return {
//       persona: {
//         tipo: persona.tipo,
//         nombres: persona.nombres,
//         apellidos: persona.apellidos,
//         dni: persona.dni,
//         ruc: persona.ruc,
//         razon_social: persona.razon_social,
//         nombre_entidad: persona.nombre_entidad,
//         email: persona.email,
//         telefono: persona.telefono,
//         direccion: persona.direccion,
//         cargo: persona.cargo
//       },
//       expediente: {
//         titulo: exp.titulo,
//         descripcion: exp.descripcion,
//         tipo: exp.tipo,
//         codigo: this.extraerParte(exp.numero_expediente, 'codigo'),
//         fecha_inicio: this.formatearFecha(exp.fecha_inicio),
//         fecha_laudo: this.formatearFecha(exp.fecha_laudo),
//         fecha_resolucion: this.formatearFecha(exp.fecha_resolucion)
//       }
//     };
//   }

//   // ============================
//   // STEP'S
//   // ============================

//   // - Validador
//   puedeIrAlPaso(step: number): boolean {

//     // MODO EDICIÓN: TODO LIBRE
//     if (this.modoEdicion) return true;

//     const persona = this.expedienteFormService.getPersona();
//     const expediente = this.expedienteFormService.getExpediente();

//     // STEP 1 → siempre permitido
//     if (step === 1) return true;

//     // STEP 2 → validar persona
//     if (step === 2) {
//       return !!(persona?.tipo && persona?.email);
//     }

//     // STEP 3 → validar expediente
//     if (step === 3) {
//       return !!(
//         persona?.tipo &&
//         expediente?.titulo &&
//         expediente?.codigo &&
//         expediente?.tipo
//       );
//     }

//     return false;
//   }

//   // - Retrocede
//   nextStep() {
//     if (this.currentStep < 3) this.currentStep++;

//   }

//   // - Avanza
//   prevStep() {

//     if (this.currentStep > 1) this.currentStep--;
//   }

//   // - Ir al step
//   irAlPaso(step: number) {

//     if (!this.puedeIrAlPaso(step)) {
//       return; // BLOQUEA
//     }


//     this.currentStep = step;
//   }


//   // ====================================
//   // HELPERS METHODS
//   // ====================================

//   // - Formatear fecha
//   private formatearFecha(fecha: string | null): string | null {
//     if (!fecha) return null;
//     return fecha.split('T')[0]; // Extrae solo YYYY-MM-DD
//   }


//   // - Descomponer el número de expediente
//   private extraerParte(numeroExpediente: string, parte: 'numero' | 'anio' | 'codigo'): string {
//     if (!numeroExpediente) return '';
//     const partes = numeroExpediente.match(/^(\d+)-(\d{4})\/([\p{L}\d\s\-ÁÉÍÓÚáéíóúÑñ]+)$/u);

//     if (!partes) return '';
//     switch (parte) {
//       case 'numero': return partes[1];
//       case 'anio': return partes[2];
//       case 'codigo': return partes[3];
//       default: return '';
//     }
//   }



//   // - Expediente creado
//   onExpedienteGuardado() {
//     this.expedienteCreado.emit();
//   }

//   // - Cerrar el modal
//   cerrarModal(): void {
//     this.mostrarModal = false;
//     this.modalCerrado.emit();
//     this.expedienteFormService.reset();

//     this.expedienteSeleccionado = null; //  MUY IMPORTANTE
//   }
// }



