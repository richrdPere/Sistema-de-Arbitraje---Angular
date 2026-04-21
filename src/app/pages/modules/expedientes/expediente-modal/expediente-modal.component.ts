import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// Services
import { ExpedienteFormService } from 'src/app/services/admin/expedientes-form.service';

// Components
import { StepPersonaComponent } from "./step-persona/step-persona.component";
import { StepExpedienteComponent } from "./step-expediente/step-expediente.component";
import { StepResumenExpComponent } from "./step-resumen-exp/step-resumen-exp.component";

@Component({
  selector: 'expediente-modal',
  imports: [CommonModule, StepPersonaComponent, StepExpedienteComponent, StepResumenExpComponent],
  templateUrl: './expediente-modal.component.html',
  styles: ``
})
export class ExpedienteModalComponent implements OnInit, OnChanges {
  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() expedienteSeleccionado: any = null;

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() expedienteCreado = new EventEmitter<void>();

  // Step
  currentStep: number = 1;
  totalSteps = 3;


  constructor(
    public expedienteFormService: ExpedienteFormService
  ) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['mostrarModal'] && this.mostrarModal) {
      this.currentStep = 1;
    }

    // Detecta cuando cambian los inputs
    if (changes['expedienteSeleccionado']) {
      if (this.expedienteSeleccionado) {
        this.modoEdicion = true;

        // Mapear data
        const formData = this.mapToFormData(this.expedienteSeleccionado);

        // Guardar en el service
        this.expedienteFormService.setFullData(formData);

        // Activar modo edición
        this.expedienteFormService.setModoEdicion(
          true,
          this.expedienteSeleccionado.id_expediente
        );

        // Opcional: ir al step 1
        this.currentStep = 1;
      } else {
        this.modoEdicion = false;
        this.expedienteFormService.reset();
      }
    }
  }

  // ====================================
  // MAPPER EXPEDIENTE
  // ====================================
  private mapToFormData(exp: any) {
    const persona = exp.participes?.[0]?.persona || {};

    return {
      persona: {
        tipo: persona.tipo,
        nombres: persona.nombres,
        apellidos: persona.apellidos,
        dni: persona.dni,
        ruc: persona.ruc,
        razon_social: persona.razon_social,
        nombre_entidad: persona.nombre_entidad,
        email: persona.email,
        telefono: persona.telefono,
        direccion: persona.direccion,
        cargo: persona.cargo
      },
      expediente: {
        titulo: exp.titulo,
        descripcion: exp.descripcion,
        tipo: exp.tipo,
        codigo: this.extraerParte(exp.numero_expediente, 'codigo'),
        fecha_inicio: this.formatearFecha(exp.fecha_inicio),
        fecha_laudo: this.formatearFecha(exp.fecha_laudo),
        fecha_resolucion: this.formatearFecha(exp.fecha_resolucion)
      }
    };
  }

  // ============================
  // STEP'S
  // ============================

  // - Validador
  puedeIrAlPaso(step: number): boolean {

    // MODO EDICIÓN: TODO LIBRE
    if (this.modoEdicion) return true;

    const persona = this.expedienteFormService.getPersona();
    const expediente = this.expedienteFormService.getExpediente();

    // STEP 1 → siempre permitido
    if (step === 1) return true;

    // STEP 2 → validar persona
    if (step === 2) {
      return !!(persona?.tipo && persona?.email);
    }

    // STEP 3 → validar expediente
    if (step === 3) {
      return !!(
        persona?.tipo &&
        expediente?.titulo &&
        expediente?.codigo &&
        expediente?.tipo
      );
    }

    return false;
  }

  // - Retrocede
  nextStep() {
    if (this.currentStep < 3) this.currentStep++;

  }

  // - Avanza
  prevStep() {

    if (this.currentStep > 1) this.currentStep--;
  }

  // - Ir al step
  irAlPaso(step: number) {

    if (!this.puedeIrAlPaso(step)) {
      return; // BLOQUEA
    }


    this.currentStep = step;
  }


  // ====================================
  // HELPERS METHODS
  // ====================================

  // - Formatear fecha
  private formatearFecha(fecha: string | null): string | null {
    if (!fecha) return null;
    return fecha.split('T')[0]; // Extrae solo YYYY-MM-DD
  }


  // - Descomponer el número de expediente
  private extraerParte(numeroExpediente: string, parte: 'numero' | 'anio' | 'codigo'): string {
    if (!numeroExpediente) return '';
    const partes = numeroExpediente.match(/^(\d+)-(\d{4})\/([\p{L}\d\s\-ÁÉÍÓÚáéíóúÑñ]+)$/u);

    if (!partes) return '';
    switch (parte) {
      case 'numero': return partes[1];
      case 'anio': return partes[2];
      case 'codigo': return partes[3];
      default: return '';
    }
  }



  // - Expediente creado
  onExpedienteGuardado() {
    this.expedienteCreado.emit();
  }

  // - Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();
    this.expedienteFormService.reset();

    this.expedienteSeleccionado = null; //  MUY IMPORTANTE
  }
}



