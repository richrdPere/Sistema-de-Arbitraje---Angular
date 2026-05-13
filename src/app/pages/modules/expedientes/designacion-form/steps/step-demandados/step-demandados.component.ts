import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { PersonaFormComponent } from '../../persona-form/persona-form.component';

// SweetAlert
import Swal from 'sweetalert2';

// Directiva
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Service
import { DesignacionFormService, Participante } from 'src/app/services/designacion-participes.service';
import { PersonaService } from 'src/app/services/persona.service';

@Component({
  selector: 'step-demandados',
  imports: [CommonModule, FormsModule, UppercaseDirective, PersonaFormComponent],
  templateUrl: './step-demandados.component.html',
  styles: ``
})
export class StepDemandadosComponent implements OnInit {
  persona_id!: number;

  nombres = '';
  apellidos = '';

  // SEARCH
  search = '';
  searchSubject = new Subject<string>();
  loadingBusqueda = false;
  personasEncontradas: any[] = [];

  // MODAL PERSONA
  mostrarModalPersona = false;
  guardandoPersona = false;

  constructor(
    public designacionFormService:
      DesignacionFormService,
    private personaService:
      PersonaService
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

  // SEARCH CHANGE
  onSearchChange() {
    this.searchSubject.next(this.search);
  }

  // BUSCAR PERSONAS
  buscarPersonas() {
    if (!this.search || this.search.trim() === '') {
      this.personasEncontradas = [];
      return;
    }
    this.loadingBusqueda = true;
    const valor = this.search.trim();

    // FILTROS
    let filtros: any = {};

    // DNI
    if (/^\d{8}$/.test(valor)) {
      filtros.dni = valor;
    }

    // RUC
    else if (/^\d{11}$/.test(valor)) {
      filtros.ruc = valor;
    }

    // TEXTO
    else {
      filtros.nombres = valor;
    }

    // REQUEST
    this.personaService
      .searchPersonaByFilters(filtros)
      .subscribe({
        next: (resp: any) => {
          this.personasEncontradas =
            resp?.data || resp || [];

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

  // AGREGAR DEMANDADO
  agregarDemandado(persona: any) {


    // - VALIDAR DUPLICADO EN DEMANDADOS
    const yaExisteDemandado =
      this.designacionFormService.current
        .demandados
        .some(
          d => d.persona_id === persona.id
        );

    if (yaExisteDemandado) {
      Swal.fire({
        icon: 'warning',
        title: 'Participante duplicado',
        text:
          'La persona ya fue agregada como demandado.'
      });

      return;
    }

    // - VALIDAR QUE NO EXISTA COMO DEMANDANTE
    const existeComoDemandante =
      this.designacionFormService.current
        .demandantes
        .some(
          d => d.persona_id === persona.id
        );

    if (existeComoDemandante) {
      Swal.fire({
        icon: 'warning',
        title: 'Participante inválido',
        text:
          'La persona ya fue agregada como demandante.'
      });

      return;
    }

    // - MAPEAR NOMBRE
    let nombres = '';
    if (persona.tipo === 'NATURAL') {
      nombres =
        `${persona.nombres || ''} ${persona.apellidos || ''}`;
    }

    else if (persona.tipo === 'JURIDICA') {
      nombres = persona.razon_social;
    }

    else if (persona.tipo === 'ENTIDAD_PUBLICA') {
      nombres = persona.nombre_entidad;
    }

    // - CREAR PARTICIPANTE
    const participante: Participante = {
      persona_id: persona.id,
      nombres,
      apellidos:
        persona.apellidos || '',
      rol: 'DEMANDADO'
    };

    // - AGREGAR
    this.designacionFormService
      .addDemandado(participante);

    // - LIMPIAR SEARCH
    this.search = '';
    this.personasEncontradas = [];

    // - ALERTA
    Swal.fire({
      icon: 'success',
      title: 'Demandado agregado',
      timer: 1200,
      showConfirmButton: false
    });
  }

  // ELIMINAR DEMANDADO
  eliminarDemandado(persona_id: number) {
    const index =
      this.designacionFormService.current
        .demandados
        .findIndex(
          d => d.persona_id === persona_id
        );

    if (index === -1) return;

    this.designacionFormService
      .removeDemandado(index);

  }

  // MODAL NUEVA PERSONA
  abrirModalNuevoParticipante() {
    this.mostrarModalPersona = true;
  }

  cerrarModalPersona() {
    this.mostrarModalPersona = false;
  }

  // GUARDAR NUEVA PERSONA
  guardarNuevaPersona(data: any) {
    this.guardandoPersona = true;
    this.personaService
      .newPersona(data)
      .subscribe({
        next: (resp: any) => {
          const persona = resp?.persona;

          // - AGREGAR AUTOMÁTICAMENTE
          this.agregarDemandado(persona);

          // - CERRAR MODAL
          this.mostrarModalPersona = false;
          this.guardandoPersona = false;

          Swal.fire({
            icon: 'success',
            title: 'Persona registrada',
            text: 'La persona fue agregada como demandado.',
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
