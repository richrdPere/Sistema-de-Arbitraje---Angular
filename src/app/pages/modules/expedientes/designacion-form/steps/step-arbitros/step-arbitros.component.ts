import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
// SweetAlert
import Swal from 'sweetalert2';

// Directiva
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Service
import { DesignacionFormService, ArbitroSeleccionado } from 'src/app/services/designacion-participes.service';
import { PersonaService } from 'src/app/services/persona.service';
import { ArbitrosService } from 'src/app/services/admin/arbitros.service';


@Component({
  selector: 'step-arbitros',
  imports: [CommonModule, FormsModule, UppercaseDirective],
  templateUrl: './step-arbitros.component.html',
  styles: ``
})
export class StepArbitrosComponent implements OnInit {

  // SEARCH
  search = '';
  searchSubject = new Subject<string>();
  loadingBusqueda = false;
  arbitrosEncontrados: any[] = [];

  // CONFIG
  tipoTribunal:
    'ARBITRO_UNICO' |
    'TRIBUNAL'
    = 'ARBITRO_UNICO';

  metodoDesignacion:
    'DIRECTA' |
    'ALEATORIA' |
    'INSTITUCIONAL'
    = 'DIRECTA';

  constructor(
    public designacionFormService: DesignacionFormService,
    private personaService: PersonaService,
    private arbitrosService: ArbitrosService
  ) { }

  ngOnInit(): void {

    // - CONFIGURAR SEGÚN TIPO ARBITRAJE
    this.configurarTipoArbitraje();

    // - SEARCH
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.buscarArbitros();
      });

  }

  // CONFIGURAR TIPO ARBITRAJE
  configurarTipoArbitraje() {
    const tipo =
      this.designacionFormService.current
        .tipoArbitraje;

    // - EMERGENCIA
    if (tipo === 'EMERGENCIA') {
      this.tipoTribunal = 'ARBITRO_UNICO';
      this.designacionFormService
        .setTipoArbitros(
          'ARBITRO_UNICO',
          false
        );
    }

    // - TRIBUNAL
    else if (tipo === 'TRIBUNAL') {
      this.tipoTribunal = 'TRIBUNAL';
      this.designacionFormService
        .setTipoArbitros(
          'TRIBUNAL',
          false
        );
    }

    // - AD HOC
    else {
      this.tipoTribunal = 'ARBITRO_UNICO';
      this.designacionFormService
        .setTipoArbitros(
          'ARBITRO_UNICO',
          false
        );
    }
  }

  // CAMBIAR TIPO TRIBUNAL
  cambiarTipoTribunal(
    tipo: 'ARBITRO_UNICO' | 'TRIBUNAL'
  ) {

    this.tipoTribunal = tipo;
    this.designacionFormService
      .setTipoArbitros(tipo);
  }

  // CAMBIAR MÉTODO
  cambiarMetodoDesignacion(
    metodo:
      'DIRECTA' |
      'ALEATORIA' |
      'INSTITUCIONAL'
  ) {
    this.metodoDesignacion = metodo;

    this.designacionFormService
      .setMetodoDesignacion(metodo);
  }

  // SEARCH CHANGE
  onSearchChange() {
    this.searchSubject.next(this.search);
  }

  // BUSCAR ÁRBITROS
  buscarArbitros() {
    if (!this.search || this.search.trim() === '') {
      this.arbitrosEncontrados = [];
      return;
    }

    this.loadingBusqueda = true;
    const valor = this.search.trim();

    let filtros: any = {
      limit: 20
    };

    // DNI
    if (/^\d{8}$/.test(valor)) {
      filtros.dni = valor;
    }
    // TEXTO
    else {
      filtros.nombres = valor;
    }
    // REQUEST
    this.arbitrosService
      .findArbitrosDisponibles(filtros)
      .subscribe({
        next: (resp: any) => {
          this.arbitrosEncontrados = resp.data || [];
          this.loadingBusqueda = false;
        },

        error: (err) => {
          console.error(err);
          this.loadingBusqueda = false;
          this.arbitrosEncontrados = [];
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              err?.error?.message ||
              'Error al buscar árbitros'
          });
        }
      });
  }

  // AGREGAR ÁRBITRO
  agregarArbitro(persona: any) {

    const arbitrosActuales =
      this.designacionFormService.current
        .arbitros
        .lista;

    // - VALIDAR DUPLICADO
    const existe = arbitrosActuales.some(
      (a: any) =>
        a.arbitro_id === persona.id_arbitro
    );

    if (existe) {
      Swal.fire({
        icon: 'warning',
        title: 'Árbitro duplicado',
        text: 'La persona ya fue agregada.'
      });

      return;
    }

    // - VALIDAR CANTIDAD
    if (
      this.tipoTribunal === 'ARBITRO_UNICO' &&
      arbitrosActuales.length >= 1
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: 'Solo puede existir un árbitro único.'
      });

      return;
    }

    if (
      this.tipoTribunal === 'TRIBUNAL' &&
      arbitrosActuales.length >= 3
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: 'El tribunal solo puede tener 3 árbitros.'
      });

      return;

    }

    // - DEFINIR ROL
    let rol:
      'ARBITRO_UNICO' |
      'PRESIDENTE' |
      'COARBITRO' |
      'SUPLENTE';

    if (this.tipoTribunal === 'ARBITRO_UNICO') {
      rol = 'ARBITRO_UNICO';
    }

    else {
      if (arbitrosActuales.length === 0) {
        rol = 'PRESIDENTE';
      }
      else {
        rol = 'COARBITRO';
      }
    }

    // - CREAR ÁRBITRO
    const arbitro:
      ArbitroSeleccionado = {
      arbitro_id: persona.id_arbitro,
      // nombres: `${persona.nombres || ''} ${persona.apellidos || ''}`,
      // apellidos: persona.apellidos || '',
      cargo: persona.cargo,
      especialidad: persona.especialidad,
      numero_colegiatura: persona.numero_colegiatura,
      disponible: persona.disponible,

      persona: {
        id: persona.persona.id,
        nombres: persona.persona.nombres,
        apellidos: persona.persona.apellidos,
        dni: persona.persona.dni,
        telefono: persona.persona.telefono,
        email: persona.persona.email
      },

      rol,
      designado_por:
        this.metodoDesignacion === 'DIRECTA'
          ? 'INSTITUCION'
          : 'ALEATORIO'
    };

    // - AGREGAR
    this.designacionFormService.addArbitro(arbitro);

    // - LIMPIAR
    this.search = '';
    this.arbitrosEncontrados = [];

    // - ALERTA
    Swal.fire({
      icon: 'success',
      title: 'Árbitro agregado',
      timer: 1200,
      showConfirmButton: false
    });
  }

  // ELIMINAR ÁRBITRO
  eliminarArbitro(arbitro_id: number) {
    const index =
      this.designacionFormService.current
        .arbitros
        .lista
        .findIndex(
          (a: any) =>
            a.arbitro_id === arbitro_id
        );
    if (index === -1) return;
    this.designacionFormService
      .removeArbitro(index);
  }
}
