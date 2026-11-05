import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';

import { UsuarioService } from
  'src/app/pages/features/usuarios/services/usuarios.service';
import type { UsuarioSelectorData } from
  'src/app/pages/features/usuarios/interfaces';

import type { ExpedienteDetalleData } from '../../interfaces';
import { ExpedientesService } from '../../services/expedientes.service';

@Component({
  selector: 'asignar-responsable',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './asignar-responsable.component.html',
})
export class AsignarResponsableComponent implements OnChanges {
  @Input() mostrarModal = false;
  @Input() expedienteId: number | null = null;

  @Output() cerrado = new EventEmitter<void>();
  @Output() asignado = new EventEmitter<void>();

  private readonly expedientesService = inject(ExpedientesService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancelarConsultas$ = new Subject<void>();

  expediente: ExpedienteDetalleData | null = null;
  usuarios: UsuarioSelectorData[] = [];
  usuarioSeleccionado: UsuarioSelectorData | null = null;

  readonly modalWidthClass = 'max-w-4xl';

  responsableId: number | null = null;
  busqueda = '';
  motivo = '';

  cargandoExpediente = false;
  buscando = false;
  guardando = false;

  errorExpediente = '';
  errorBusqueda = '';
  errorGuardado = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['mostrarModal'] && !changes['expedienteId']) return;

    this.cancelarConsultas$.next();
    this.expediente = null;
    this.usuarios = [];
    this.usuarioSeleccionado = null;
    this.responsableId = null;
    this.busqueda = '';
    this.motivo = '';
    this.errorExpediente = '';
    this.errorBusqueda = '';
    this.errorGuardado = '';

    if (this.mostrarModal) {
      this.cargarExpediente();
    }
  }

  get responsableActualId(): number | null {
    return this.expediente?.usuario_responsable_id ?? null;
  }

  get hayCambios(): boolean {
    return this.expediente !== null &&
      this.responsableId !== this.responsableActualId;
  }

  get nombreSeleccionado(): string {
    if (this.responsableId === null) return 'Sin responsable';

    if (this.usuarioSeleccionado) {
      return this.usuarioSeleccionado.nombre || this.usuarioSeleccionado.correo;
    }

    return this.expediente?.responsable?.correo ||
      `Usuario #${this.responsableId}`;
  }

  cargarExpediente(): void {
    if (!this.mostrarModal || this.cargandoExpediente || this.guardando) return;

    const id = this.expedienteId;

    if (id === null || !Number.isSafeInteger(id) || id <= 0) {
      this.errorExpediente = 'No se pudo identificar el expediente.';
      return;
    }

    this.cargandoExpediente = true;
    this.errorExpediente = '';

    this.expedientesService.getExpedienteById(id).pipe(
      takeUntil(this.cancelarConsultas$),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.cargandoExpediente = false;
      }),
    ).subscribe({
      next: (respuesta) => {
        if (!respuesta.success || !respuesta.data) {
          this.errorExpediente =
            respuesta.message || 'No se pudo cargar el expediente.';
          return;
        }

        this.expediente = respuesta.data;
        this.responsableId = this.responsableActualId;
        this.buscarUsuarios();
      },
      error: (error: unknown) => {
        this.errorExpediente = this.mensajeError(
          error,
          'No se pudo cargar el expediente.',
        );
      },
    });
  }

  buscarUsuarios(): void {
    if (!this.mostrarModal || !this.expediente || this.buscando || this.guardando) {
      return;
    }

    this.buscando = true;
    this.errorBusqueda = '';
    this.usuarios = [];

    this.usuarioService.getUsuariosSelector({
      search: this.busqueda.trim() || undefined,
      rol: 'SECRETARIA',
      estado: true,
      limit: 20,
    }).pipe(
      takeUntil(this.cancelarConsultas$),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.buscando = false;
      }),
    ).subscribe({
      next: (respuesta) => {
        if (!respuesta.success) {
          this.errorBusqueda =
            respuesta.message || 'No se pudieron cargar las secretarias.';
          return;
        }

        this.usuarios = respuesta.data.items;
      },
      error: (error: unknown) => {
        this.errorBusqueda = this.mensajeError(
          error,
          'No se pudieron cargar las secretarias.',
        );
      },
    });
  }

  seleccionar(usuario: UsuarioSelectorData): void {
    if (this.guardando) return;

    this.usuarioSeleccionado = usuario;
    this.responsableId = usuario.id_usuario;
    this.errorGuardado = '';
  }

  retirarResponsable(): void {
    if (this.guardando) return;

    this.usuarioSeleccionado = null;
    this.responsableId = null;
    this.errorGuardado = '';
  }

  guardar(): void {
    const expediente = this.expediente;

    if (
      !this.mostrarModal ||
      !expediente ||
      this.cargandoExpediente ||
      this.buscando ||
      this.guardando ||
      !this.hayCambios
    ) {
      return;
    }

    this.guardando = true;
    this.errorGuardado = '';

    this.expedientesService.asignarExpedienteResponsable(
      expediente.id_expediente,
      {
        usuario_responsable_id: this.responsableId,
        motivo: this.motivo.trim() || null,
      },
    ).pipe(
      takeUntil(this.cancelarConsultas$),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.guardando = false;
      }),
    ).subscribe({
      next: (respuesta) => {
        if (!respuesta.success) {
          this.errorGuardado =
            respuesta.message || 'No se pudo guardar la asignación.';
          return;
        }

        this.asignado.emit();
      },
      error: (error: unknown) => {
        this.errorGuardado = this.mensajeError(
          error,
          'No se pudo guardar la asignación.',
        );
      },
    });
  }

  cerrar(): void {
    if (!this.guardando) this.cerrado.emit();
  }

  private mensajeError(error: unknown, respaldo: string): string {
    const mensaje = (error as { message?: unknown } | null)?.message;
    return typeof mensaje === 'string' && mensaje.trim() ? mensaje : respaldo;
  }
}
