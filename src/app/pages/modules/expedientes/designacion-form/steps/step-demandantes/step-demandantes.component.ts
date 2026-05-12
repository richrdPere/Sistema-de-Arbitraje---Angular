import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesignacionFormService, Participante } from 'src/app/services/designacion-participes.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PersonaFormComponent } from "../../persona-form/persona-form.component";

// SweetAlert
import Swal from 'sweetalert2';

// Directiva
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Service
import { PersonaService } from 'src/app/services/persona.service';

@Component({
  selector: 'step-demandantes',
  imports: [CommonModule, FormsModule, UppercaseDirective, PersonaFormComponent],
  templateUrl: './step-demandantes.component.html',
  styles: ``
})
export class StepDemandantesComponent {
  persona_id!: number;
  nombres = '';
  apellidos = '';

  search = '';
  searchSubject = new Subject<string>();
  loadingBusqueda = false;
  personasEncontradas: any[] = [];

  mostrarModalPersona = false;
  guardandoPersona = false;

  constructor(

    public designacionFormService:
      DesignacionFormService,
    private personaService: PersonaService
  ) { }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.buscarPersonas();
      });
  }

  onSearchChange() {
    this.searchSubject.next(this.search);
  }

  // ======================================
  // METHODS
  // ======================================
  agregar() {
    if (!this.persona_id) return;
    this.designacionFormService.addDemandante({
      persona_id: this.persona_id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      rol: 'DEMANDANTE'
    });

    this.persona_id = 0;
    this.nombres = '';
    this.apellidos = '';
  }

  buscarPersonas() {
    if (!this.search || this.search.trim() === '') {
      this.personasEncontradas = [];
      return;
    }
    this.loadingBusqueda = true;
    const valor = this.search.trim();


    // ARMAR FILTROS DINÁMICOS
    let filtros: any = {};

    // DNI
    if (/^\d{8}$/.test(valor)) {
      filtros.dni = valor;
    }

    // RUC
    else if (/^\d{11}$/.test(valor)) {
      filtros.ruc = valor;
    }

    // TEXTO → nombres / razón social
    else {
      filtros.nombres = valor;
    }

    // REQUEST
    this.personaService
      .searchPersonaByFilters(filtros)
      .subscribe({

        next: (resp: any) => {
          console.log('PERSONAS ENCONTRADAS:', resp);

          // Si backend devuelve arreglo directamente
          this.personasEncontradas = resp?.data || resp || [];
          this.loadingBusqueda = false;
        },

        error: (err) => {
          console.error(err);
          this.loadingBusqueda = false;
          this.personasEncontradas = [];
          Swal.fire({
            icon: 'error',
            title: 'Error al buscar personas',
            text:
              err?.error?.message ||
              'Ocurrió un error al buscar personas.'
          });
        }
      });
  }

  // ============================================
  // AGREGAR DEMANDANTE
  // ============================================
  agregarDemandante(persona: any) {
    // VALIDAR DUPLICADO
    const existe =
      this.designacionFormService.current.demandantes
        .some(
          d => d.persona_id === persona.id
        );
    if (existe) {
      Swal.fire({
        icon: 'warning',
        title: 'Participante duplicado',
        text: 'La persona ya fue agregada como demandante.'
      });
      return;
    }

    // MAPEAR NOMBRE
    let nombres = '';

    if (persona.tipo === 'NATURAL') {
      nombres =
        `${persona.nombres || ''} ${persona.apellidos || ''}`;

    } else if (persona.tipo === 'JURIDICA') {
      nombres = persona.razon_social;
    } else if (persona.tipo === 'ENTIDAD_PUBLICA') {
      nombres = persona.nombre_entidad;

    }

    // CREAR PARTICIPANTE
    const participante: Participante = {
      persona_id: persona.id,
      nombres,
      apellidos: persona.apellidos || '',
      rol: 'DEMANDANTE'
    };

    this.designacionFormService
      .addDemandante(participante);

    Swal.fire({
      icon: 'success',
      title: 'Demandante agregado',
      timer: 1200,
      showConfirmButton: false
    });
  }

  // ============================================
  // ELIMINAR
  // ============================================
  eliminarDemandante(persona_id: number) {
    const index =
      this.designacionFormService.current
        .demandantes
        .findIndex(
          d => d.persona_id === persona_id
        );
    if (index === -1) return;

    this.designacionFormService
      .removeDemandante(index);
  }

  // ============================================
  // MODAL NUEVO PARTICIPANTE
  // ============================================
  abrirModalNuevoParticipante() {
    this.mostrarModalPersona = true;
  }

  cerrarModalPersona() {
    this.mostrarModalPersona = false;
  }

  // ============================================
  // GUARDAR NUEVA PERSONA
  // ============================================
  guardarNuevaPersona(data: any) {
    this.guardandoPersona = true;
    this.personaService
      .newPersona(data)
      .subscribe({
        next: (resp: any) => {
          const persona =
            resp?.persona;

          // AGREGAR AUTOMÁTICAMENTE
          this.agregarDemandante(persona);

          // CERRAR MODAL
          this.mostrarModalPersona = false;
          this.guardandoPersona = false;

          Swal.fire({
            icon: 'success',
            title: 'Persona registrada',
            text: 'La persona fue agregada como demandante.',
            timer: 1500,
            showConfirmButton: false
          });
        },

        error: (err) => {
          console.error(err);
          this.guardandoPersona = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              err?.error?.message ||
              'No se pudo registrar la persona.'
          });
        }
      });
  }
}
