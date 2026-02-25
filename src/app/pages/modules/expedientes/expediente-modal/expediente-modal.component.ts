import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Services
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { AuthService } from 'src/app/services/auth.service';



@Component({
  selector: 'expediente-modal',
  imports: [ReactiveFormsModule, UppercaseDirective],
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
  currentStep = 1;
  totalSteps = 3;


  constructor(
    private fb: FormBuilder,
    private expedienteService: ExpedientesService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.obtenerSecretariaId();
    this.autoAsignarCodigo();
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
    // if (changes['expedienteSeleccionado'] && this.expedienteSeleccionado) {
    //   this.modoEdicion = true;
    //   this.patchFormExpediente();
    // }
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

  inicializarFormulario(): void {
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

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Enviar Formulario
  crearOEditarExpediente(): void {
    if (this.formExpediente.invalid) {
      this.formExpediente.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos.',
      });
      return;
    }

    if (!this.secretariaId) {
      this.mensajeError = 'No se encontró la sesión de la secretaria.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    // const expediente = this.formExpediente.value;
    // const expediente: any = { ...this.formExpediente.value };
    const raw = this.formExpediente.value;

    const expediente = {
      ...raw,
      fecha_inicio: raw.fecha_inicio
        ? new Date(raw.fecha_inicio).toISOString()
        : new Date().toISOString(), //  fallback
      fecha_laudo: raw.fecha_laudo
        ? new Date(raw.fecha_laudo).toISOString()
        : null,
      fecha_resolucion: raw.fecha_resolucion
        ? new Date(raw.fecha_resolucion).toISOString()
        : null,
    };

    // ============================
    // MODO EDICIÓN
    // ============================
    if (this.modoEdicion && this.expedienteSeleccionado?.id_expediente) {
      this.expedienteService
        .actualizarExpediente(this.expedienteSeleccionado.id_expediente, expediente)
        .subscribe({
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
        });

      return;
    }

    // ============================
    // MODO CREACIÓN
    // ============================
    this.expedienteService.crearExpediente(expediente).subscribe({
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
    //this.formExpediente.reset();
    this.expedienteSeleccionado = null; //  MUY IMPORTANTE
  }

  get f() {
    return this.formExpediente.controls;
  }


}
