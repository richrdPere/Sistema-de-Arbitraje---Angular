import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { MesaPartesFormService } from 'src/app/pages/features/solicitudes/services/mesa-partes-form.service';
import { MesaPartesService } from 'src/app/pages/features/solicitudes/services/mesa-partes.service';

// Interfaces
import { RegisterTramitePublicoRequest } from 'src/app/pages/features/solicitudes/interfaces';

@Component({
  selector: 'step-resumen',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './step-resumen.component.html',
  styles: ``,
})
export class StepResumenComponent implements OnInit {

  private readonly destroyRef = inject(DestroyRef);

  @Output() prevStep = new EventEmitter<void>();
  @Output() resetStepper = new EventEmitter<void>();

  // Conserva por ahora el tipo del servicio de borrador,
  // que actualmente utiliza any internamente.
  data: ReturnType<MesaPartesFormService['getFormData']>;

  loading = false;
  registrado = false;

  constructor(
    private readonly mesaPartesFormService: MesaPartesFormService,
    private readonly mesaPartesService: MesaPartesService,
  ) { }

  // *********************************************************
  // INICIALIZACIÓN
  // *********************************************************
  ngOnInit(): void {
    this.data = this.mesaPartesFormService.getFormData();
  }

  // *********************************************************
  // CONSTRUIR PAYLOAD
  // Mantiene la estructura del formulario original.
  // *********************************************************
  construirPayload(): RegisterTramitePublicoRequest {
    const data = this.mesaPartesFormService.getFormData();

    return {
      demandante: {
        ...data.demandante,
      },

      demandado: {
        ...data.demandado,
      },

      solicitud: {
        codigo: data.solicitud.codigo,
        tipo_solicitud: data.solicitud.tipo_solicitud,
        descripcion: data.solicitud.descripcion,
      },
    };
  }

  // *********************************************************
  // VALIDACIÓN PREVIA AL ENVÍO
  // El backend realiza la validación definitiva.
  // *********************************************************
  private validarDatos(): string | null {
    const data = this.data;

    if (
      !data?.demandante?.tipo ||
      !data?.demandado?.tipo
    ) {
      return 'Completa los datos del demandante y del demandado.';
    }

    const tiposSolicitud = [
      'ARBITRAJE_DE_EMERGENCIA',
      'ARBITRAJE_AD_HOC',
      'ARBITRAJE_INSTITUCIONAL',
    ];

    if (
      !tiposSolicitud.includes(
        data.solicitud?.tipo_solicitud,
      )
    ) {
      return 'Selecciona un tipo de solicitud válido.';
    }

    if (
      typeof data.solicitud?.descripcion !== 'string' ||
      !data.solicitud.descripcion.trim()
    ) {
      return 'Completa la descripción de la solicitud.';
    }

    const dniDemandante = String(
      data.demandante.dni ?? '',
    ).trim();

    const dniDemandado = String(
      data.demandado.dni ?? '',
    ).trim();

    const rucDemandante = String(
      data.demandante.ruc ?? '',
    ).trim();

    const rucDemandado = String(
      data.demandado.ruc ?? '',
    ).trim();

    if (
      (
        dniDemandante &&
        dniDemandante === dniDemandado
      ) ||
      (
        rucDemandante &&
        rucDemandante === rucDemandado
      )
    ) {
      return 'El demandante y el demandado no pueden ser la misma persona.';
    }

    if (
      !Array.isArray(data.archivos) ||
      data.archivos.some(
        (archivo: unknown) => !(archivo instanceof File),
      )
    ) {
      return 'La lista de archivos no es válida.';
    }

    return null;
  }

  // *********************************************************
  // REGISTRAR TRÁMITE PÚBLICO
  // *********************************************************
  enviar(): void {
    if (this.loading || this.registrado) {
      return;
    }

    this.data = this.mesaPartesFormService.getFormData();

    const errorValidacion = this.validarDatos();

    if (errorValidacion) {
      void Swal.fire({
        icon: 'warning',
        title: 'Revisa la información',
        text: errorValidacion,
        confirmButtonText: 'Aceptar',
      });

      return;
    }

    const payload = this.construirPayload();
    const archivos: File[] = [...this.data.archivos];

    this.loading = true;

    this.mesaPartesService.registerTramitePublico(
      payload,
      archivos,
    )
      .pipe(
        finalize(() => {
          this.loading = false;
        }),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            void Swal.fire({
              icon: 'error',
              title: 'No se pudo registrar el trámite',
              text: response.message || 'Revisa la información enviada.',
              confirmButtonText: 'Aceptar',
            });

            return;
          }

          this.registrado = true;

          // Se utiliza text para mostrar el mensaje
          // sin interpolar contenido del servidor como HTML.
          // void Swal.fire({
          //   title: 'Trámite registrado correctamente',
          //   html: `
          //        <div class="text-left">
          //          <p><strong>Número de trámite:</strong> ${response.data.numero_tramite}</p>
          //          <p><strong>Estado:</strong> ${response.data.estado} </p>
          //          <p><strong>Mensaje:</strong> Sirvase revisar su correo electrónico para más instrucciones</p>
          //        </div>
          //      `,
          //   icon: 'success',
          //   confirmButtonText: 'Aceptar',
          //   confirmButtonColor: '#198754',
          // });


          void Swal.fire({
            icon: 'success',
            title: 'Trámite registrado correctamente',
            text: response.message,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#198754',
          });

          this.mesaPartesFormService.reset();
          this.resetStepper.emit();
        },

        error: (error: unknown) => {
          void Swal.fire({
            icon: 'error',
            title: 'Error al registrar la solicitud',
            text:
              error instanceof Error && error.message
                ? error.message
                : 'Ocurrió un error al procesar tu trámite.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#d33',
          });
        },
      });
  }

  // *********************************************************
  // VOLVER
  // *********************************************************
  volver(): void {
    if (this.loading || this.registrado) {
      return;
    }

    this.prevStep.emit();
  }
}

// import Swal from 'sweetalert2';
// import { CommonModule } from '@angular/common';
// import { Component, OnInit, Output, EventEmitter } from '@angular/core';

// // Services
// import { TramiteMPVFormService } from 'src/app/pages/features/solicitudes/services/mesa-partes-form.service';
// import { TramiteMPVService } from 'src/app/services/mesa-partes/tramiteMPV.service';


// @Component({
//   selector: 'step-resumen',
//   imports: [CommonModule],
//   templateUrl: './step-resumen.component.html',
//   styles: ``
// })
// export class StepResumenComponent implements OnInit {
//   @Output() prevStep = new EventEmitter<void>();
//   @Output() resetStepper = new EventEmitter<void>();

//   data: any;
//   loading = false;

//   constructor(
//     private tramiteFormService: TramiteMPVFormService,
//     private tramiteService: TramiteMPVService,
//   ) { }

//   ngOnInit(): void {
//     this.data = this.tramiteFormService.getFormData();
//   }

//   // =========================
//   // FORMATEAR ENVÍO
//   // =========================
//   construirPayload() {
//     return {
//       demandante: this.data.demandante,
//       demandado: this.data.demandado,
//       solicitud: this.data.solicitud
//     };
//   }

//   construirFormData() {
//     const formData = new FormData();

//     // JSON
//     formData.append('data', JSON.stringify(this.construirPayload()));

//     // FILES
//     this.data.archivos.forEach((file: File) => {
//       formData.append('files', file);
//     });

//     return formData;
//   }

//   // =========================
//   // ENVIAR
//   // =========================
//   enviar() {
//     this.loading = true;

//     const formData = this.construirFormData();

//     console.log("ENVIANDO DATA: ", formData);
//     this.tramiteService.newTramite(formData)
//       .subscribe({
//         next: (response: any) => {
//           this.loading = false;

//           Swal.fire({
//             title: 'Trámite registrado correctamente',
//             html: `
//                  <div class="text-left">
//                    <p><strong>Número de trámite:</strong> ${response.tramite.numero_tramite}</p>
//                    <p><strong>Estado:</strong> ${response.tramite.estado} </p>
//                    <p><strong>Mensaje:</strong> Sirvase revisar su correo electrónico para más instrucciones</p>
//                  </div>
//                `,
//             icon: 'success',
//             confirmButtonText: 'Aceptar',
//             confirmButtonColor: '#198754',
//           });

//           this.tramiteFormService.reset();
//           this.resetStepper.emit(); // avisar al padre
//         },
//         error: (err) => {
//           this.loading = false;

//           Swal.fire({
//             icon: 'error',
//             title: 'Error al registrar la solicitud',
//             text: err?.message || 'Ocurrió un error al procesar tu trámite.',
//             confirmButtonColor: '#d33'
//           });
//         }
//       });
//   }

//   volver() {
//     this.prevStep.emit();
//   }
// }
