import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Observable, firstValueFrom, switchMap } from 'rxjs';

import { PersonaService } from '../personas/services/persona.service';
import {
  PersonalDataMap,
  PersonalPaginadoFilters,
  PersonalPagination,
  TipoPersonal,
  TipoPersonalConDisponibilidad,
} from './interfaces';
import { PersonalService } from './services/personal.service';

type PerfilPersonal = PersonalDataMap[TipoPersonal];
type ModoFormulario = 'crear' | 'editar' | 'ver';

interface RespuestaPersonal {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './personal.component.html',
})
export class PersonalComponent implements OnInit {
  private readonly personalService = inject(PersonalService);
  private readonly personaService = inject(PersonaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tipos: ReadonlyArray<{ valor: TipoPersonal; etiqueta: string }> = [
    { valor: 'SECRETARIA', etiqueta: 'Secretaría' },
    { valor: 'ARBITRO', etiqueta: 'Árbitros' },
    { valor: 'ADJUDICADOR', etiqueta: 'Adjudicadores' },
    { valor: 'STAFF_INTERNO', etiqueta: 'Personal interno' },
  ];

  tipo: TipoPersonal = 'SECRETARIA';
  filtroEstado = '';
  filtroDisponibilidad = '';

  perfiles: PerfilPersonal[] = [];
  paginacion: PersonalPagination | null = null;

  ocupado = false;
  error = '';
  aviso = '';

  modo: ModoFormulario | null = null;
  idEdicion: number | null = null;
  formulario = this.formularioVacio();

  ngOnInit(): void {
    void this.cargar();
  }

  get admiteDisponibilidad(): boolean {
    return this.tipo === 'ARBITRO' || this.tipo === 'ADJUDICADOR';
  }

  cambiarTipo(tipo: TipoPersonal): void {
    this.tipo = tipo;
    this.filtroEstado = '';
    this.filtroDisponibilidad = '';
    this.aviso = '';
    this.cerrarFormulario();
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.perfiles = [];
    this.paginacion = null;
    void this.cargar(1);
  }

  async cargar(page = this.paginacion?.page ?? 1): Promise<void> {
    const filtros: PersonalPaginadoFilters = {
      page,
      limit: 10,
      sort_order: 'DESC',
    };

    if (this.filtroEstado !== '') {
      filtros.estado = this.filtroEstado === 'true';
    }

    if (this.admiteDisponibilidad && this.filtroDisponibilidad !== '') {
      filtros.disponible = this.filtroDisponibilidad === 'true';
    }

    const respuesta = await this.ejecutar(
      this.personalService.getPersonalPaginado(this.tipo, filtros),
    );

    if (respuesta) {
      this.perfiles = respuesta.data.items;
      this.paginacion = respuesta.data.pagination;
    }
  }

  abrirCreacion(): void {
    this.error = '';
    this.aviso = '';
    this.idEdicion = null;
    this.formulario = this.formularioVacio();
    this.modo = 'crear';
  }

  async abrirPerfil(
    perfil: PerfilPersonal,
    modo: 'editar' | 'ver',
  ): Promise<void> {
    const id = this.obtenerId(perfil);
    const respuesta = await this.ejecutar(
      this.personalService.getPersonalById(this.tipo, id),
    );

    if (!respuesta) return;

    const personal = respuesta.data.personal;

    this.idEdicion = id;
    this.formulario = {
      personaId: personal.persona_id,
      cargo: this.obtenerCargo(personal),
      fechaIngreso:
        'fecha_ingreso' in personal
          ? personal.fecha_ingreso?.slice(0, 10) ?? ''
          : '',
      especialidad:
        'especialidad' in personal ? personal.especialidad ?? '' : '',
      experiencia:
        'experiencia' in personal ? personal.experiencia ?? '' : '',
      colegiatura:
        'numero_colegiatura' in personal
          ? personal.numero_colegiatura ?? ''
          : '',
      estado: personal.estado,
      disponible: this.estaDisponible(personal),
    };
    this.modo = modo;
  }

  cerrarFormulario(): void {
    this.modo = null;
    this.idEdicion = null;
  }

  async guardar(): Promise<void> {
    if (this.ocupado || (this.modo !== 'crear' && this.modo !== 'editar')) {
      return;
    }

    const formulario = this.formulario;

    if (
      this.modo === 'crear' &&
      (
        formulario.personaId === null ||
        !Number.isSafeInteger(formulario.personaId) ||
        formulario.personaId <= 0 ||
        formulario.personaId > 2147483647
      )
    ) {
      this.error = 'Ingresa un ID de persona válido.';
      return;
    }

    if (
      this.modo === 'editar' &&
      this.tipo !== 'STAFF_INTERNO' &&
      !formulario.cargo.trim()
    ) {
      this.error = 'Ingresa el cargo del perfil.';
      return;
    }

    const esCreacion = this.modo === 'crear';
    const solicitud = this.prepararGuardado();

    if (!solicitud) return;

    const respuesta = await this.ejecutar(solicitud);

    if (respuesta) {
      this.cerrarFormulario();
      this.aviso = respuesta.message;
      await this.cargar(esCreacion ? 1 : undefined);
    }
  }

  async cambiarEstado(perfil: PerfilPersonal): Promise<void> {
    const respuesta = await this.ejecutar(
      this.personalService.changePersonalEstado(
        this.tipo,
        this.obtenerId(perfil),
        { estado: !perfil.estado },
      ),
    );

    if (respuesta) {
      this.aviso = respuesta.message;
      await this.cargar();
    }
  }

  async cambiarDisponibilidad(perfil: PerfilPersonal): Promise<void> {
    const tipo = this.tipo;

    if (tipo !== 'ARBITRO' && tipo !== 'ADJUDICADOR') return;
    if (!perfil.estado) return;

    const respuesta = await this.ejecutar(
      this.personalService.changePersonalDisponibilidad(
        tipo,
        this.obtenerId(perfil),
        { disponible: !this.estaDisponible(perfil) },
      ),
    );

    if (respuesta) {
      this.aviso = respuesta.message;
      await this.cargar();
    }
  }

  obtenerId(perfil: PerfilPersonal): number {
    if ('id_secretaria' in perfil) return perfil.id_secretaria;
    if ('id_arbitro' in perfil) return perfil.id_arbitro;
    if ('id_adjudicador' in perfil) return perfil.id_adjudicador;
    return perfil.id_staff_interno;
  }

  obtenerCargo(perfil: PerfilPersonal): string {
    return 'cargo' in perfil ? perfil.cargo : '';
  }

  estaDisponible(perfil: PerfilPersonal): boolean {
    return 'disponible' in perfil && perfil.disponible;
  }

  private prepararGuardado(): Observable<RespuestaPersonal> | null {
    const tipo = this.tipo;
    const form = this.formulario;
    const cargo = form.cargo.trim();
    const datosSecretaria = {
      ...(cargo ? { cargo } : {}),
      fecha_ingreso: form.fechaIngreso || null,
    };
    const datosProfesionales = {
      ...(cargo ? { cargo } : {}),
      especialidad: form.especialidad.trim() || null,
      experiencia: form.experiencia.trim() || null,
      numero_colegiatura: form.colegiatura.trim() || null,
    };

    if (this.modo === 'editar' && this.idEdicion !== null) {
      if (tipo === 'SECRETARIA') {
        return this.personalService.updatePersonal(
          tipo, this.idEdicion, datosSecretaria,
        );
      }

      if (tipo === 'ARBITRO' || tipo === 'ADJUDICADOR') {
        return this.personalService.updatePersonal(
          tipo, this.idEdicion, datosProfesionales,
        );
      }

      return null;
    }

    const personaId = form.personaId;
    if (this.modo !== 'crear' || personaId === null) return null;

    const base = { persona_id: personaId, estado: form.estado };

    return this.personaService.getPersonaById(personaId).pipe(
      switchMap((respuesta): Observable<RespuestaPersonal> => {
        if (!respuesta.success) throw new Error(respuesta.message);

        if (respuesta.data.persona.tipo !== 'NATURAL') {
          throw new Error('Selecciona una persona natural para crear el perfil.');
        }

        if (tipo === 'SECRETARIA') {
          return this.personalService.createPersonal(tipo, {
            ...base,
            ...datosSecretaria,
          });
        }

        if (tipo === 'ARBITRO' || tipo === 'ADJUDICADOR') {
          return this.crearPerfilProfesional(tipo, {
            ...base,
            ...datosProfesionales,
            disponible: base.estado && form.disponible,
          });
        }

        return this.personalService.createPersonal(tipo, base);
      }),
    );
  }

  private crearPerfilProfesional(
    tipo: TipoPersonalConDisponibilidad,
    datos: {
      persona_id: number;
      estado: boolean;
      cargo?: string;
      especialidad: string | null;
      experiencia: string | null;
      numero_colegiatura: string | null;
      disponible: boolean;
    },
  ): Observable<RespuestaPersonal> {
    return this.personalService.createPersonal(tipo, datos);
  }

  private async ejecutar<T extends RespuestaPersonal>(
    solicitud: Observable<T>,
  ): Promise<T | null> {
    if (this.ocupado) return null;

    this.ocupado = true;
    this.error = '';

    try {
      const respuesta = await firstValueFrom(
        solicitud.pipe(takeUntilDestroyed(this.destroyRef)),
        { defaultValue: null },
      );

      if (respuesta && !respuesta.success) {
        this.error = respuesta.message;
        return null;
      }

      return respuesta;
    } catch (error: unknown) {
      const mensaje = (error as { message?: unknown } | null)?.message;
      this.error = typeof mensaje === 'string' && mensaje.trim()
        ? mensaje
        : 'No se pudo completar la operación.';
      return null;
    } finally {
      this.ocupado = false;
    }
  }

  private formularioVacio() {
    return {
      personaId: null as number | null,
      cargo: '',
      fechaIngreso: '',
      especialidad: '',
      experiencia: '',
      colegiatura: '',
      estado: true,
      disponible: true,
    };
  }
}
