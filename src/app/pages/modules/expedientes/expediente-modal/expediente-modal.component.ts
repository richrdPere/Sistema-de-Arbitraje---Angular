import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Services
import { AuthService } from 'src/app/services/auth.service';
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { ExpedienteFormService } from 'src/app/services/admin/expedientes-form.service';
import { CommonModule } from '@angular/common';
import { StepPersonaComponent } from "./step-persona/step-persona.component";
import { StepExpedienteComponent } from "./step-expediente/step-expediente.component";
import { StepResumenExpComponent } from "./step-resumen-exp/step-resumen-exp.component";



@Component({
  selector: 'expediente-modal',
  imports: [ReactiveFormsModule, CommonModule, StepPersonaComponent, StepExpedienteComponent, StepResumenExpComponent], // UppercaseDirective,
  templateUrl: './expediente-modal.component.html',
  styles: ``
})
export class ExpedienteModalComponent implements OnInit, OnChanges {
  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() expedienteSeleccionado: any = null;

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() expedienteCreado = new EventEmitter<void>();


  formExpediente!: FormGroup;
  formPersona!: FormGroup;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';
  secretariaId: number | null = null;

  tipoSolicitudToCodigo: any = {
    "Arbitraje de Emergencia": "AE-FIRMA-LEGAL",
    "Arbitraje Ad Hoc": "AD HOC-FIRMA-LEGAL",
    "Arbitraje Institucional": "CA-FIRMA-LEGAL",
  };

  // Step
  currentStep: number = 1;
  totalSteps = 3;


  constructor(
    private fb: FormBuilder,
    private expedienteService: ExpedientesService,
    private authService: AuthService,
    public expedienteFormService: ExpedienteFormService
  ) { }

  ngOnInit() {
    this.initFormExpediente();
    this.initFormPersona();

    const persona = this.expedienteFormService.getPersona();
    const expediente = this.expedienteFormService.getExpediente();

    if (persona) this.formPersona.patchValue(persona);
    if (expediente) this.formExpediente.patchValue(expediente);
  }



  ngOnChanges(changes: SimpleChanges): void {
    //  Si el formulario aún no está creado, salir
    if (!this.formExpediente) return;

    // Detecta cuando cambian los inputs
    if (changes['expedienteSeleccionado']) {
      if (this.expedienteSeleccionado) {
        this.modoEdicion = true;

        this.formExpediente.reset(); //  siempre limpia antes
        this.patchFormExpediente();
      } else {
        this.modoEdicion = false;
        this.formExpediente.reset();
      }
    }
  }

  private getFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  private formatearFecha(fecha: string | null): string | null {
    if (!fecha) return null;
    return fecha.split('T')[0]; // Extrae solo YYYY-MM-DD
  }


  //  Función para descomponer el número de expediente
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
  private patchFormExpediente(): void {

    this.formExpediente.patchValue({
      titulo: this.expedienteSeleccionado.titulo || '',
      descripcion: this.expedienteSeleccionado.descripcion || '',
      tipo: this.expedienteSeleccionado.tipo || '',
      estado: this.expedienteSeleccionado.estado || '',
      codigo: this.extraerParte(this.expedienteSeleccionado.numero_expediente, 'codigo'),
      fecha_inicio: this.formatearFecha(this.expedienteSeleccionado.fecha_inicio),
      fecha_laudo: this.formatearFecha(this.expedienteSeleccionado.fecha_laudo),
      fecha_resolucion: this.formatearFecha(this.expedienteSeleccionado.fecha_resolucion),
      fecha_cierre: this.formatearFecha(this.expedienteSeleccionado.fecha_cierre),
    });
  }



  //  Obtener ID del usuario logueado (secretaria)
  private obtenerSecretariaId(): void {
    const usuario = this.authService.getUser(); // obtiene desde BehaviorSubject o localStorage

    if (usuario && usuario.rol === 'secretaria' && usuario.detalles) {
      this.secretariaId = usuario.detalles.id_secretaria;
    }

    // else if (usuario) {
    //   console.warn(` El usuario logueado (${usuario.nombre}) no es una secretaria o no tiene detalles asociados.`);
    // } else {
    //   console.warn(' No se encontró información del usuario logueado.');
    // }
  }

  initFormExpediente(): void {
    this.formExpediente = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      codigo: ['', Validators.required],
      tipo: [null, Validators.required],
      estado: [''],
      fecha_inicio: [this.getFechaHoy()],
      fecha_laudo: [null],
      fecha_resolucion: [null],
      fecha_cierre: [null],
    });
  }

  initFormPersona() {
    this.formPersona = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      documento: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
    });
  }

  getExpedienteData() {
    const data = this.expedienteFormService.getExpediente();
    if (data) {
      this.formExpediente.patchValue(data);
    }
  }

  nextStep() {
    if (this.currentStep < 3) this.currentStep++;

  }

  prevStep() {

    if (this.currentStep > 1) this.currentStep--;
  }


  irAlPaso(step: number) {
    this.currentStep = step;
  }
  // Enviar Formulario
  crearOEditarExpediente(): void {

    this.cargando = true;
    const payload = this.expedienteFormService.buildPayload();

    if (this.expedienteFormService.getModoEdicion()) {

      const id = this.expedienteFormService.getExpedienteId();

      // MODO EDICIÓN
      this.expedienteService.updateExpediente(id!, payload.expediente)
        .subscribe(
          {
            next: () => {
              this.cargando = false;
              // this.mensajeExito = 'Expediente actualizado correctamente.';
              Swal.fire({ icon: 'success', title: 'Expediente actualizado correctamente' });
              this.expedienteCreado.emit();
              this.cerrarModal();
            },
            error: (err) => {
              this.cargando = false;
              // this.mensajeError = err.error?.message || 'Error al actualizar expediente.';
              Swal.fire({
                icon: 'error',
                title: 'Error al actualizar expediente.',
                text: err.error?.message || 'Error desconocido.',
              });
            },
          }
        );

    } else {
      // MODO CREACION
      this.expedienteService.newExpediente(payload)
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Expediente creado correctamente',
              text: 'Sirvase a asignar los participes y los arbitros.'
            });

            this.expedienteCreado.emit(); // refrescar tabla
            this.cerrarModal();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al crear usuario',
              text: err.error?.message || 'Error desconocido',
            });
          }
        });

    }

  }

  // Asignar Codigo
  autoAsignarCodigo(): void {
    this.formExpediente.get("tipo")?.valueChanges.subscribe(tipo => {
      const codigo = this.tipoSolicitudToCodigo[tipo] || "";
      this.formExpediente.get("codigo")?.setValue(codigo, { emitEvent: false });
    });
  }

  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();

    this.expedienteSeleccionado = null; //  MUY IMPORTANTE
  }

  get f() {
    return this.formExpediente.controls;
  }


}






// this.mensajeError = '';
// this.mensajeExito = '';

// const raw = this.formExpediente.value;

// const expediente = {
//   ...raw,
//   fecha_inicio: raw.fecha_inicio
//     ? new Date(raw.fecha_inicio).toISOString()
//     : new Date().toISOString(), //  fallback
//   fecha_laudo: raw.fecha_laudo
//     ? new Date(raw.fecha_laudo).toISOString()
//     : null,
//   fecha_resolucion: raw.fecha_resolucion
//     ? new Date(raw.fecha_resolucion).toISOString()
//     : null,
// };

// // ============================
// // MODO EDICIÓN
// // ============================
// if (this.modoEdicion && this.expedienteSeleccionado?.id_expediente) {
//   this.expedienteService
//     .updateExpediente(this.expedienteSeleccionado.id_expediente, expediente)
//     .subscribe({
//       next: () => {
//         this.cargando = false;
//         // this.mensajeExito = 'Expediente actualizado correctamente.';
//         Swal.fire({ icon: 'success', title: 'Expediente actualizado correctamente' });
//         this.expedienteCreado.emit();
//         this.cerrarModal();
//       },
//       error: (err) => {
//         this.cargando = false;
//         // this.mensajeError = err.error?.message || 'Error al actualizar expediente.';
//         Swal.fire({
//           icon: 'error',
//           title: 'Error al actualizar expediente.',
//           text: err.error?.message || 'Error desconocido.',
//         });
//       },
//     });

//   return;
// }

// // ============================
// // MODO CREACIÓN
// // ============================
// this.expedienteService.newExpediente(expediente).subscribe({
//   next: () => {
//     Swal.fire({
//       icon: 'success',
//       title: 'Expediente creado correctamente',
//       text: 'Sirvase a asignar los participes y los arbitros.'
//     });

//     this.expedienteCreado.emit(); // refrescar tabla
//     this.cerrarModal();
//   },
//   error: (err) => {
//     Swal.fire({
//       icon: 'error',
//       title: 'Error al crear usuario',
//       text: err.error?.message || 'Error desconocido',
//     });
//   }
// });
