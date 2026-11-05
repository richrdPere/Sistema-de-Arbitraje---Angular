import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { firstValueFrom, merge } from 'rxjs';

import type { AuthPersonaTipo } from 'src/app/core/models/auth-session.model';
import type { RegisterPersonaRequest } from 'src/app/pages/auth/interfaces';
import { PersonalService } from 'src/app/pages/features/personal/services/personal.service';
import type {
  FindPersonaFilters,
  PersonaData,
} from 'src/app/pages/features/personas/interfaces';
import { PersonaService } from 'src/app/pages/features/personas/services/persona.service';
import type {
  CreateUsuarioRequest,
  CreateUsuarioRol,
  UpdateUsuarioRequest,
  UsuarioListadoData,
} from 'src/app/pages/features/usuarios/interfaces';
import { UsuarioService } from 'src/app/pages/features/usuarios/services/usuarios.service';

type ModoPersona = 'NUEVA' | 'EXISTENTE';
type RolConPerfil = 'SECRETARIA' | 'ARBITRO' | 'ADJUDICADOR';

@Component({
  selector: 'usuarios-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios-form.component.html',
})
export class UsuariosFormComponent implements OnChanges {
  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() usuarioSeleccionado: UsuarioListadoData | null = null;

  @Output() usuarioCreado = new EventEmitter<void>();
  @Output() modalCerrado = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly usuarios = inject(UsuarioService);
  private readonly personas = inject(PersonaService);
  private readonly personal = inject(PersonalService);

  readonly roles: ReadonlyArray<{ valor: CreateUsuarioRol; texto: string }> = [
    { valor: 'ADMIN', texto: 'Administrador' },
    { valor: 'PARTICIPE', texto: 'Partícipe' },
    { valor: 'STAFF_INTERNO', texto: 'Staff interno' },
    { valor: 'SECRETARIA', texto: 'Secretaría' },
    { valor: 'ARBITRO', texto: 'Árbitro' },
    { valor: 'ADJUDICADOR', texto: 'Adjudicador' },
  ];

  readonly form = this.fb.group({
    rol: this.fb.control<CreateUsuarioRol>('PARTICIPE'),
    modoPersona: this.fb.control<ModoPersona>('NUEVA'),
    tipo: this.fb.control<AuthPersonaTipo>('NATURAL'),
    dni: '',
    ruc: '',
    nombres: '',
    apellidos: '',
    razon_social: '',
    nombre_entidad: '',
    email: '',
    telefono: '',
    direccion: '',
    cargo: '',
    foto_perfil: '',
  });

  personaEncontrada: PersonaData | null = null;
  buscando = false;
  guardando = false;
  error = '';

  constructor() {
    const controles = this.form.controls;

    merge(
      controles.modoPersona.valueChanges,
      controles.tipo.valueChanges,
      controles.dni.valueChanges,
      controles.ruc.valueChanges,
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.limpiarBusqueda());

    controles.rol.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.rolConPerfil && controles.tipo.value !== 'NATURAL') {
          controles.tipo.setValue('NATURAL');
        }
        this.error = '';
      });
  }

  ngOnChanges(): void {
    if (!this.mostrarModal || this.ocupado) return;

    const usuario = this.modoEdicion ? this.usuarioSeleccionado : null;
    const persona = usuario?.persona;

    this.form.reset({
      rol: usuario?.rol ?? 'PARTICIPE',
      modoPersona: 'NUEVA',
      tipo: persona?.tipo ?? 'NATURAL',
      dni: persona?.dni ?? '',
      ruc: persona?.ruc ?? '',
      nombres: persona?.nombres ?? '',
      apellidos: persona?.apellidos ?? '',
      razon_social: persona?.razon_social ?? '',
      nombre_entidad: persona?.nombre_entidad ?? '',
      email: persona?.email ?? '',
      telefono: persona?.telefono ?? '',
      direccion: persona?.direccion ?? '',
      cargo: persona?.cargo ?? '',
      foto_perfil: usuario?.foto_perfil ?? '',
    }, { emitEvent: false });

    this.limpiarBusqueda();
  }

  get ocupado(): boolean {
    return this.buscando || this.guardando;
  }

  get esExistente(): boolean {
    return !this.modoEdicion && this.form.controls.modoPersona.value === 'EXISTENTE';
  }

  get esNatural(): boolean {
    return this.form.controls.tipo.value === 'NATURAL';
  }

  get rolConPerfil(): RolConPerfil | null {
    if (this.modoEdicion) return null;

    const rol = this.form.controls.rol.value;
    return rol === 'SECRETARIA' || rol === 'ARBITRO' || rol === 'ADJUDICADOR'
      ? rol
      : null;
  }

  get correoAcceso(): string {
    if (this.modoEdicion) return this.usuarioSeleccionado?.correo ?? '';

    const email = this.esExistente
      ? this.personaEncontrada?.email
      : this.form.controls.email.value;

    return (email ?? '').trim().toLowerCase();
  }

  get nombreEncontrado(): string {
    const persona = this.personaEncontrada;
    if (!persona) return '';

    if (persona.tipo === 'NATURAL') {
      return [persona.nombres, persona.apellidos].filter(Boolean).join(' ');
    }

    return persona.tipo === 'JURIDICA'
      ? persona.razon_social ?? ''
      : persona.nombre_entidad ?? '';
  }

  async buscarPersona(): Promise<void> {
    if (!this.esExistente || this.ocupado) return;

    this.limpiarBusqueda();

    const tipo = this.form.controls.tipo.value;
    const esDni = tipo === 'NATURAL';
    const documento = this.form.controls[esDni ? 'dni' : 'ruc'].value.trim();

    if (!(esDni ? /^\d{8}$/ : /^\d{11}$/).test(documento)) {
      this.error = esDni
        ? 'Ingresa un DNI de 8 dígitos.'
        : 'Ingresa un RUC de 11 dígitos.';
      return;
    }

    const filtros: FindPersonaFilters = esDni
      ? { dni: documento }
      : { ruc: documento };

    this.buscando = true;

    try {
      const respuesta = await firstValueFrom(this.personas.findPersona(filtros));
      this.comprobarRespuesta(respuesta);

      const persona = respuesta.data?.persona;

      if (!persona) {
        throw new Error('No se encontró una persona con ese documento.');
      }

      if (persona.tipo !== tipo) {
        throw new Error('El documento corresponde a otro tipo de persona.');
      }

      this.personaEncontrada = persona;
    } catch (error: unknown) {
      const apiError = error as { statusCode?: number } | null;
      this.error = apiError?.statusCode === 404
        ? 'No se encontró una persona registrada con ese documento.'
        : this.mensajeError(error);
    } finally {
      this.buscando = false;
    }
  }

  async guardar(): Promise<void> {
    if (this.ocupado) return;

    this.error = '';
    this.guardando = true;

    try {
      if (this.modoEdicion) {
        await this.actualizarUsuario();
      } else {
        await this.crearUsuario();
      }

      this.usuarioCreado.emit();
      this.modalCerrado.emit();
    } catch (error: unknown) {
      this.error = this.mensajeError(error);
    } finally {
      this.guardando = false;
    }
  }

  cerrar(): void {
    if (!this.ocupado) this.modalCerrado.emit();
  }

  private async crearUsuario(): Promise<void> {
    const rol = this.form.controls.rol.value;
    const rolConPerfil = this.rolConPerfil;
    const correo = this.correoAcceso;
    let persona = this.personaEncontrada;

    if (this.esExistente && !persona) {
      throw new Error('Busca y selecciona a la persona por su documento.');
    }

    if (!correo || Validators.email(new FormControl(correo))) {
      throw new Error(
        this.esExistente
          ? 'La persona necesita un correo de contacto válido. Actualízalo en Personas.'
          : 'Ingresa un correo de contacto válido.',
      );
    }

    let request: CreateUsuarioRequest;

    if (rolConPerfil) {
      if (!persona) {
        const datos = this.datosPersona(correo);

        if (datos.tipo !== 'NATURAL' || !datos.dni) {
          throw new Error('Ingresa el DNI de la persona natural.');
        }

        const respuesta = await firstValueFrom(this.personas.createPersona(datos));
        this.comprobarRespuesta(respuesta);

        persona = respuesta.data.persona;

        // Si falla el perfil o la cuenta, el siguiente intento reutiliza la persona.
        this.form.controls.modoPersona.setValue('EXISTENTE', { emitEvent: false });
        this.personaEncontrada = persona;
      }

      if (persona.tipo !== 'NATURAL') {
        throw new Error('El rol seleccionado requiere una persona natural.');
      }

      await this.asegurarPerfil(rolConPerfil, persona.id_persona);
      request = { correo, rol, persona_id: persona.id_persona };
    } else {
      request = persona
        ? { correo, rol, persona_id: persona.id_persona }
        : { correo, rol, persona: this.datosPersona(correo) };
    }

    this.comprobarRespuesta(
      await firstValueFrom(this.usuarios.createUsuario(request)),
    );
  }

  private async asegurarPerfil(
    rol: RolConPerfil,
    personaId: number,
  ): Promise<void> {
    const listado = await firstValueFrom(
      this.personal.getPersonalPaginado(rol, {
        persona_id: personaId,
        page: 1,
        limit: 1,
      }),
    );

    this.comprobarRespuesta(listado);

    const perfil = listado.data.items.find((item) => item.persona_id === personaId);

    if (perfil) {
      if (!perfil.estado) {
        throw new Error('El perfil está deshabilitado. Habilítalo en Gestión de personal.');
      }
      return;
    }

    this.comprobarRespuesta(
      await firstValueFrom(
        this.personal.createPersonal(rol, { persona_id: personaId }),
      ),
    );
  }

  private async actualizarUsuario(): Promise<void> {
    const usuario = this.usuarioSeleccionado;
    if (!usuario) throw new Error('Selecciona el usuario que deseas editar.');

    const email = this.form.controls.email.value.trim().toLowerCase();

    if (email && Validators.email(new FormControl(email))) {
      throw new Error('Ingresa un correo de contacto válido.');
    }

    const { tipo: _tipo, ...persona } = this.datosPersona(email || null);
    const request: UpdateUsuarioRequest = { persona };
    const foto = this.form.controls.foto_perfil.value.trim() || null;

    if (foto !== (usuario.foto_perfil ?? null)) {
      request.foto_perfil = foto;
    }

    this.comprobarRespuesta(
      await firstValueFrom(this.usuarios.updateUsuario(usuario.id_usuario, request)),
    );
  }

  private datosPersona(email: string | null): RegisterPersonaRequest {
    const form = this.form.getRawValue();
    const contacto = {
      email,
      telefono: form.telefono.trim() || null,
      direccion: form.direccion.trim() || null,
      cargo: form.cargo.trim() || null,
    };

    if (form.tipo === 'NATURAL') {
      const nombres = form.nombres.trim();
      const apellidos = form.apellidos.trim();
      const dni = form.dni.trim();

      if (!nombres || !apellidos) {
        throw new Error('Ingresa los nombres y apellidos.');
      }
      if (dni && !/^\d{8}$/.test(dni)) {
        throw new Error('El DNI debe tener 8 dígitos.');
      }

      return { ...contacto, tipo: 'NATURAL', nombres, apellidos, dni: dni || null };
    }

    const ruc = form.ruc.trim();

    if (ruc && !/^\d{11}$/.test(ruc)) {
      throw new Error('El RUC debe tener 11 dígitos.');
    }

    if (form.tipo === 'JURIDICA') {
      const razon_social = form.razon_social.trim();
      if (!razon_social) throw new Error('Ingresa la razón social.');

      return { ...contacto, tipo: 'JURIDICA', razon_social, ruc: ruc || null };
    }

    const nombre_entidad = form.nombre_entidad.trim();
    if (!nombre_entidad) throw new Error('Ingresa el nombre de la entidad.');

    return {
      ...contacto,
      tipo: 'ENTIDAD_PUBLICA',
      nombre_entidad,
      ruc: ruc || null,
    };
  }

  private limpiarBusqueda(): void {
    this.personaEncontrada = null;
    this.error = '';
  }

  private comprobarRespuesta(respuesta: { success: boolean; message: string }): void {
    if (!respuesta.success) throw new Error(respuesta.message);
  }

  private mensajeError(error: unknown): string {
    const mensaje = (error as { message?: unknown } | null)?.message;
    return typeof mensaje === 'string' && mensaje.trim()
      ? mensaje
      : 'No se pudo completar la operación.';
  }
}
