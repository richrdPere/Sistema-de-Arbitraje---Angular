import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { finalize, Subscription } from 'rxjs';


// Directives
import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';

// Service
import { MesaPartesService } from 'src/app/pages/features/solicitudes/services/mesa-partes.service';

// Interfaces
import { ConsultarTramiteData, MesaPartesTipoSolicitud } from 'src/app/pages/features/solicitudes/interfaces';

@Component({
  selector: 'app-consulta-expedientes',
  standalone: true,
  imports: [
    UppercaseDirective,
    ReactiveFormsModule,
    DatePipe,
  ],
  templateUrl: './consulta_expedientes.component.html',
})
export class ConsultaExpedientesComponent implements OnDestroy {

  // *********************************************************
  // FORMULARIO
  // *********************************************************
  readonly formConsulta: FormGroup<{
    numeroExpediente: FormControl<string>;
  }>;

  // *********************************************************
  // ESTADO
  // *********************************************************
  resultado: ConsultarTramiteData | null = null;
  cargando = false;
  errorMsg = '';

  private consultaSubscription?: Subscription;

  // *********************************************************
  // ETIQUETAS
  // *********************************************************
  readonly tiposSolicitud: Record<MesaPartesTipoSolicitud, string> = {
    ARBITRAJE_DE_EMERGENCIA: 'Arbitraje de emergencia',
    ARBITRAJE_AD_HOC: 'Arbitraje ad hoc',
    ARBITRAJE_INSTITUCIONAL: 'Arbitraje institucional',
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly mesaPartesService: MesaPartesService,
  ) {
    this.formConsulta = this.fb.nonNullable.group({
      numeroExpediente: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
        ],
      ],
    });
  }

  // *********************************************************
  // 1. CONSULTAR POR NÚMERO DE TRÁMITE O EXPEDIENTE
  // *********************************************************
  consultarExpediente(): void {
    if (this.cargando) {
      return;
    }

    const control =
      this.formConsulta.controls.numeroExpediente;

    const numero = control.value.trim();

    control.setValue(numero);

    this.resultado = null;
    this.errorMsg = '';

    if (this.formConsulta.invalid) {
      this.formConsulta.markAllAsTouched();
      return;
    }

    this.cargando = true;

    this.consultaSubscription = this.mesaPartesService
      .consultarTramite({ numero })
      .pipe(
        finalize(() => {
          this.cargando = false;
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.errorMsg =
              response.message || 'No se pudo realizar la consulta.';

            return;
          }

          if (!response.data?.items?.length) {
            this.errorMsg =
              'No se encontraron trámites o expedientes con ese número.';

            return;
          }

          this.resultado = response.data;
        },

        error: (error: unknown) => {
          this.resultado = null;

          this.errorMsg =
            error instanceof Error && error.message
              ? error.message
              : 'No se pudo realizar la consulta. Intente nuevamente.';
        },
      });
  }

  // *********************************************************
  // 2. REINICIAR CONSULTA
  // *********************************************************
  reset(): void {
    this.consultaSubscription?.unsubscribe();
    this.consultaSubscription = undefined;

    this.resultado = null;
    this.errorMsg = '';
    this.cargando = false;

    this.formConsulta.reset({
      numeroExpediente: '',
    });
  }

  // *********************************************************
  // CICLO DE VIDA
  // *********************************************************
  ngOnDestroy(): void {
    this.consultaSubscription?.unsubscribe();
  }
}

// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { DatePipe } from '@angular/common';

// // Service
// import { TramiteMPVService } from 'src/app/services/mesa-partes/tramiteMPV.service';

// @Component({
//   selector: 'app-consulta-expedientes',
//   imports: [ReactiveFormsModule, DatePipe],
//   templateUrl: './consulta_expedientes.component.html',
// })
// export class ConsultaExpedientesComponent {
//   formConsulta: FormGroup;
//   resultado: any = null;
//   cargando = false;
//   errorMsg = '';

//   constructor(private fb: FormBuilder, private http: HttpClient, private tramiteService: TramiteMPVService) {
//     this.formConsulta = this.fb.group({
//       numeroExpediente: ['', [Validators.required, Validators.minLength(5)]],
//     });
//   }

//   consultarExpediente() {
//     if (this.formConsulta.invalid) return;

//     const numero = this.formConsulta.value.numeroExpediente.trim();
//     this.resultado = null;
//     this.errorMsg = '';
//     this.cargando = true;

//     this.tramiteService.obtenerPorNumero(numero)
//       .subscribe({
//         next: (data: any) => {
//           this.cargando = false;
//           if (data) {
//             this.resultado = data;
//           } else {
//             this.errorMsg = 'No se encontró ningún expediente con ese número.';
//           }
//         },
//         error: (err) => {
//           this.cargando = false;
//           this.errorMsg = 'Error al consultar el expediente. Intente nuevamente.';

//         }
//       });

//     //  Ajusta la URL a tu backend (ejemplo)
//     // this.tramiteService.obtenerPorNumero(numero).subscribe({
//     //   next: r => { this.resultado = r; this.loading = false; },
//     //   error: e => { this.resultado = null; this.loading = false; alert('No encontrado'); }
//     // });
//   }

//   reset() {
//     this.resultado = null;
//     this.errorMsg = '';
//     this.formConsulta.reset();
//   }


// }
