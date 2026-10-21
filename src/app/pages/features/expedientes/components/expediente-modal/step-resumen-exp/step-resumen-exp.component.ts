import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject, finalize, map, takeUntil } from 'rxjs';

// Services
import { ExpedientesService } from 'src/app/pages/features/expedientes/services/expedientes.service';
import { ExpedienteFormService, FormDataExpediente } from 'src/app/pages/features/expedientes/services/expedientes-form.service';

// Interfaces
import {
  CreateExpedienteRequest,
  ExpedienteTipo,
  UpdateExpedienteDatosRequest,
  UpdateExpedienteRequest,
} from
  'src/app/pages/features/expedientes/interfaces';

// ==========================================================
// RESULTADO COMÚN PARA CREACIÓN Y EDICIÓN
// ==========================================================

interface ResultadoGuardado {
  success: boolean;
  message?: string | null;
  modificado: boolean;
}

@Component({
  selector: 'step-resumen-exp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-resumen-exp.component.html',
  styles: ``,
})
export class StepResumenExpComponent
  implements OnInit, OnDestroy {

  // ==========================================================
  // OUTPUTS
  // ==========================================================

  @Output() prevStep = new EventEmitter<void>();
  @Output() resetStepper = new EventEmitter<void>();
  @Output() expedienteGuardado = new EventEmitter<void>();

  // ==========================================================
  // ESTADO
  // ==========================================================

  data: FormDataExpediente = {
    persona: {},
    expediente: {},
  };

  loading = false;

  private readonly destroy$ = new Subject<void>();

  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================

  constructor(
    private readonly expedienteFormService: ExpedienteFormService,
    private readonly expedienteService: ExpedientesService,
  ) { }

  // ==========================================================
  // CICLO DE VIDA
  // ==========================================================

  ngOnInit(): void {
    // Mantiene actualizado el resumen incluso si el componente
    // permanece montado mientras se cambia de paso.
    this.expedienteFormService.formData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.data = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================================
  // NAVEGACIÓN
  // ==========================================================

  volver(): void {
    if (this.loading) {
      return;
    }

    this.prevStep.emit();
  }

  // ==========================================================
  // GUARDAR
  // ==========================================================

  guardar(): void {
    if (this.loading) {
      return;
    }

    const esEdicion = this.esEdicion;

    let solicitud$: Observable<ResultadoGuardado>;

    try {
      if (esEdicion) {
        const id =
          this.expedienteFormService.getExpedienteId();

        if (
          id === null ||
          !Number.isInteger(id) ||
          id <= 0
        ) {
          throw new Error(
            'No se ha identificado el expediente que deseas actualizar.',
          );
        }

        const request = this.buildUpdateRequest();

        solicitud$ = this.expedienteService
          .updateExpediente(id, request)
          .pipe(
            map((response): ResultadoGuardado => ({
              success: response.success,
              message: response.message,
              modificado:
                response.data?.modificado ?? false,
            })),
          );
      } else {
        const request = this.buildCreateRequest();

        solicitud$ = this.expedienteService
          .createExpediente(request)
          .pipe(
            map((response): ResultadoGuardado => ({
              success: response.success,
              message: response.message,
              modificado: true,
            })),
          );
      }
    } catch (error: unknown) {
      void Swal.fire({
        icon: 'warning',
        title: 'Revisa los datos',
        text: this.obtenerMensajeError(
          error,
          'Completa los datos requeridos antes de guardar.',
        ),
      });

      return;
    }

    this.loading = true;

    solicitud$
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (resultado) => {
          if (!resultado.success) {
            void Swal.fire({
              icon: 'error',
              title: esEdicion
                ? 'No se pudo actualizar el expediente'
                : 'No se pudo registrar el expediente',
              text:
                resultado.message ||
                'La operación no pudo completarse.',
            });

            return;
          }

          // Puede que el padre cierre el modal al recibir
          // expedienteGuardado. Liberamos primero el estado.
          this.loading = false;

          const sinCambios =
            esEdicion && !resultado.modificado;

          void Swal.fire({
            icon: sinCambios ? 'info' : 'success',
            title: sinCambios
              ? 'Sin cambios'
              : esEdicion
                ? 'Expediente actualizado'
                : 'Expediente registrado',
            text:
              resultado.message ||
              (
                sinCambios
                  ? 'Los datos enviados coinciden con los registrados.'
                  : esEdicion
                    ? 'El expediente se actualizó correctamente.'
                    : 'El expediente se registró correctamente.'
              ),
          });

          this.expedienteGuardado.emit();

          // Se conserva por compatibilidad con tu HTML.
          this.resetStepper.emit();
        },

        error: (error: unknown) => {
          void Swal.fire({
            icon: 'error',
            title: esEdicion
              ? 'Error al actualizar expediente'
              : 'Error al registrar expediente',
            text: this.obtenerMensajeError(
              error,
              esEdicion
                ? 'No se pudo actualizar el expediente.'
                : 'No se pudo registrar el expediente.',
            ),
          });
        },
      });
  }

  // ==========================================================
  // PAYLOAD DE CREACIÓN
  // Admite NATURAL, JURIDICA y ENTIDAD_PUBLICA.
  // ==========================================================

  private buildCreateRequest(): CreateExpedienteRequest {
    const persona = this.expedienteFormService.getPersona();

    const expediente = this.buildDatosExpediente();

    const contacto = {
      email: this.textoOpcional(persona.email),
      telefono: this.textoOpcional(persona.telefono),
      direccion: this.textoOpcional(persona.direccion),
    };

    switch (persona.tipo) {
      // ======================================================
      // PERSONA NATURAL
      // ======================================================
      case 'NATURAL': {
        const nombres = this.texto(persona.nombres);
        const apellidos = this.texto(persona.apellidos);
        const dni = this.texto(persona.dni);

        if (!nombres || !apellidos) {
          throw new Error(
            'Completa los nombres y apellidos de la persona.',
          );
        }

        if (!/^\d{8}$/.test(dni)) {
          throw new Error(
            'El DNI debe contener exactamente 8 dígitos.',
          );
        }

        return {
          persona: {
            tipo: 'NATURAL',
            nombres,
            apellidos,
            dni,
            ...contacto,
          },

          expediente,
        };
      }

      // ======================================================
      // PERSONA JURÍDICA
      // ======================================================
      case 'JURIDICA': {
        const razonSocial = this.texto(persona.razon_social);
        const ruc = this.texto(persona.ruc);

        if (!razonSocial) {
          throw new Error(
            'Completa la razón social de la persona jurídica.',
          );
        }

        if (!/^\d{11}$/.test(ruc)) {
          throw new Error(
            'El RUC debe contener exactamente 11 dígitos.',
          );
        }

        return {
          persona: {
            tipo: 'JURIDICA',
            razon_social: razonSocial,
            ruc,
            ...contacto,
          },

          expediente,
        };
      }

      // ======================================================
      // ENTIDAD PÚBLICA
      // ======================================================
      case 'ENTIDAD_PUBLICA': {
        const nombreEntidad = this.texto(persona.nombre_entidad);
        const ruc = this.texto(persona.ruc);

        if (!nombreEntidad) {
          throw new Error(
            'Completa el nombre de la entidad pública.',
          );
        }

        if (!/^\d{11}$/.test(ruc)) {
          throw new Error(
            'El RUC debe contener exactamente 11 dígitos.',
          );
        }

        return {
          persona: {
            tipo: 'ENTIDAD_PUBLICA',
            nombre_entidad: nombreEntidad,
            ruc,
            ...contacto,
          },

          expediente,
        };
      }

      default:
        throw new Error(
          'Selecciona un tipo de persona válido.',
        );
    }
  }

  // ==========================================================
  // PAYLOAD DE EDICIÓN
  // ==========================================================

  private buildUpdateRequest(): UpdateExpedienteRequest {
    const expediente: UpdateExpedienteDatosRequest =
      this.buildDatosExpediente();

    // Este endpoint no recibe persona.
    return { expediente };
  }

  // ==========================================================
  // DATOS GENERALES DEL EXPEDIENTE
  // ==========================================================

  private buildDatosExpediente(): CreateExpedienteRequest['expediente'] {
    const { expediente } =
      this.expedienteFormService.buildPayload();

    const titulo = this.texto(expediente.titulo);
    const codigo = this.texto(expediente.codigo);
    const tipo = expediente.tipo;

    if (titulo.length < 3) {
      throw new Error(
        'El título debe contener al menos 3 caracteres.',
      );
    }

    if (!codigo) {
      throw new Error(
        'El expediente debe tener un código.',
      );
    }

    if (!this.esTipoExpediente(tipo)) {
      throw new Error(
        'Selecciona un tipo de arbitraje válido.',
      );
    }

    return {
      codigo,
      titulo,
      tipo,

      // null permite limpiar estos campos al editar.
      descripcion: this.textoOpcional(
        expediente.descripcion,
      ),

      fecha_inicio: this.textoOpcional(
        expediente.fecha_inicio,
      ),

      fecha_laudo: this.textoOpcional(
        expediente.fecha_laudo,
      ),

      fecha_resolucion: this.textoOpcional(
        expediente.fecha_resolucion,
      ),
    };
  }

  // ==========================================================
  // HELPERS
  // ==========================================================

  private esTipoExpediente(
    valor: unknown,
  ): valor is ExpedienteTipo {
    return (
      valor === 'ARBITRAJE_INSTITUCIONAL' ||
      valor === 'ARBITRAJE_DE_EMERGENCIA' ||
      valor === 'ARBITRAJE_AD_HOC'
    );
  }

  private texto(valor: unknown): string {
    return typeof valor === 'string'
      ? valor.trim()
      : '';
  }

  private textoOpcional(valor: unknown): string | null {
    return this.texto(valor) || null;
  }

  private esObjeto(
    valor: unknown,
  ): valor is Record<string, unknown> {
    return (
      typeof valor === 'object' &&
      valor !== null &&
      !Array.isArray(valor)
    );
  }

  private obtenerMensajeError(
    error: unknown,
    mensajeDefecto: string,
  ): string {
    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    if (this.esObjeto(error)) {
      // Respuesta HTTP sin transformar.
      const detalle = error['error'];

      if (this.esObjeto(detalle)) {
        const mensaje = this.texto(detalle['message']);

        if (mensaje) {
          return mensaje;
        }
      }

      // Error transformado por HttpServiceHelper
      // o Error generado al construir el payload.
      const mensaje = this.texto(error['message']);

      if (mensaje) {
        return mensaje;
      }
    }

    return mensajeDefecto;
  }

  // ==========================================================
  // DATA VIEW
  // ==========================================================

  get persona(): FormDataExpediente['persona'] {
    return this.data.persona;
  }

  get expediente(): FormDataExpediente['expediente'] {
    return this.data.expediente;
  }

  get esEdicion(): boolean {
    return this.expedienteFormService.getModoEdicion();
  }
}
