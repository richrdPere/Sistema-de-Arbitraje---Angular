import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Pipes
import { FileSizePipe } from 'src/app/pipes/size-file.pipe';
import { TruncatePipe } from 'src/app/pipes/truncate.pipe';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
import { ValidacionesService } from 'src/app/pages/shared/services/validaciones.service';
import { TramiteMPVFormService } from 'src/app/services/tramiteMPV-form.service';

// Components
import { StepDemandanteComponent } from "./steps/step-demandante/step-demandante.component";
import { StepDemandadoComponent } from "./steps/step-demandado/step-demandado.component";
import { StepSolicitudComponent } from "./steps/step-solicitud/step-solicitud.component";
import { StepArchivosComponent } from "./steps/step-archivos/step-archivos.component";
import { StepResumenComponent } from "./steps/step-resumen/step-resumen.component";

// Interface
export interface TramiteForm {
  demandante: any;
  demandado: any;
  solicitud: any;
  archivos?: File[];
}

@Component({
  selector: 'app-mesa-partes',

  // FileSizePipe, TruncatePipe, UppercaseDirective,
  imports: [ReactiveFormsModule, CommonModule, StepDemandanteComponent, StepDemandadoComponent, StepSolicitudComponent, StepArchivosComponent, StepResumenComponent],
  templateUrl: './mesa_partes.component.html',
})
export class MesaPartesComponent implements OnInit {


  fechaActual: string = '';
  numeroSolicitud: string = '';
  tipoUsuarioSeleccionado: string = 'natural';
  tipoUsuarioDemandado: string = 'natural';

  colorAlerta: string = 'rgb(0, 32, 91)';

  // STEP CONTROL
  currentStep: number = 1;

  formTramiteMPV: FormGroup;
  file: File | null = null;
  enviado = false;
  respuesta: any;

  archivos: File[] = [];
  placeholderDocumento = 'Seleccione tipo de documento';
  maxDocumentoDemandante = 8; // valor por defecto


  tipoSolicitudToCodigo: any = {
    "Arbitraje de Emergencia": "AE-FIRMA-LEGAL",
    "Arbitraje Ad Hoc": "AD HOC-FIRMA-LEGAL",
    "Arbitraje Institucional": "CA-FIRMA-LEGAL",
  };

  descripcionTipoArbitraje: string | null = null;

  descripciones: Record<string, string> = {
    'Arbitraje de Emergencia':
      'Procedimiento excepcional y rápido destinado a resolver situaciones urgentes que requieren una medida inmediata antes de la constitución del tribunal arbitral.',

    'Arbitraje Ad Hoc':
      'Arbitraje organizado directamente por las partes, sin intervención de una institución arbitral. Las reglas y el procedimiento son definidos por los propios interesados.',

    'Arbitraje Institucional':
      'Arbitraje administrado por una institución arbitral, que brinda reglas, soporte administrativo y supervisión del procedimiento.'
  };

  // Selectores
  tipoUsuarios = [
    { id: 'natural', nombre: 'PERSONA NATURAL' },
    { id: 'juridica', nombre: 'JURIDICA' },
    { id: 'entidad_publica', nombre: 'ENTIDAD PÚBLICA' }
  ];



  constructor(
    private fb: FormBuilder,
    private tramiteService: TramiteMPVService,
    private tramiteFormService: TramiteMPVFormService,
    private validacionesService: ValidacionesService) {
    this.formTramiteMPV = this.fb.group({

      // =========================
      // STEP 1 — DATOS DEL INTERESADO
      // =========================
      tipo: [null, Validators.required],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      dni: ['', Validators.required],
      correo: ['',
        [Validators.required, Validators.email],
        [this.validacionesService.validarCorreo()]
      ],
      direccion: ['', Validators.required],
      cargo: [''],
      telefono: [''],
      ruc: [''],
      razon_social: [''],
      nombre_entidad: [''],

      // =========================
      // STEP 2 — DATOS DEL DEMANDANDO
      // =========================
      tipoDemandado: [null, Validators.required],
      nombreDemandado: ['', Validators.required],
      apellidosDemandado: ['', Validators.required],
      dniDemandado: ['', Validators.required],
      correoDemandado: ['',
        [Validators.required, Validators.email],
        [this.validacionesService.validarCorreo()]
      ],
      direccionDemandado: ['', Validators.required],
      cargoDemandado: [''],
      telefonoDemandado: [''],
      rucDemandado: [''],
      razon_socialDemandado: [''],
      nombre_entidadDemandado: [''],

      // =========================
      // STEP 3 — DATOS DEL ARBITRAJE
      // =========================
      tipo_solicitud: ['', Validators.required],
      codigo: ['', Validators.required], // viene desde el sistema


      // =========================
      // STEP 4 — CONTROL INTERNO
      // =========================
      fecha_registro: [this.fechaActual],
      descripcion: ['', Validators.required],


    });
  }

  ngOnInit() {
    this.actualizarFechaHora();
    this.obtenerPreview();

    // Actualiza cada segundo
    setInterval(() => {
      this.actualizarFechaHora();
    }, 1000);


    this.formTramiteMPV.get('tipo_solicitud')?.valueChanges.subscribe(tipo => {
      if (!tipo) return;

      this.formTramiteMPV.patchValue({
        codigo: this.tipoSolicitudToCodigo[tipo],
      });

      this.descripcionTipoArbitraje = this.descripciones[tipo];

    });

    // this.dniRucDemandante();
    this.autoAsignarCodigo();
    this.formTramiteMPV.get('tipo')?.valueChanges.subscribe(tipo => {
      this.onTipoUsuarioChange(null);
    });

    this.formTramiteMPV.get('tipoDemandado')?.valueChanges.subscribe(tipo => {
      this.onTipoUsuarioDemandadoChange(null);
    });

  }

  obtenerPreview() {
    this.tramiteService.previewNumeroTramite()
      .subscribe(resp => {
        this.numeroSolicitud = resp.numero;

      });
  }

  actualizarFechaHora() {
    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');

    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    this.fechaActual = `${anio}/${mes}/${dia} - ${horas}:${minutos}`;
  }

  dniRucDemandante(): void {
    const dniCtrl = this.formTramiteMPV.get("dni");
    const rucCtrl = this.formTramiteMPV.get("ruc");

    // if (!tipoCtrl || !documentoCtrl) return;
    if (!rucCtrl || !dniCtrl) return;

    // =========================
    // 🔹 DNI
    // =========================
    dniCtrl.setValidators([
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(8),
      Validators.pattern(/^[0-9]+$/)
    ]);

    dniCtrl.setAsyncValidators(this.validacionesService.validarDni());

    // =========================
    // 🔹 RUC
    // =========================
    rucCtrl.setValidators([
      Validators.required,
      Validators.minLength(11),
      Validators.maxLength(11),
      Validators.pattern(/^[0-9]+$/)
    ]);

    rucCtrl.setAsyncValidators(this.validacionesService.validarRuc());

    // =========================
    // ACTUALIZAR
    // =========================
    dniCtrl.updateValueAndValidity();
    rucCtrl.updateValueAndValidity();
  }

  autoAsignarCodigo(): void {
    this.formTramiteMPV.get("tipo_solicitud")?.valueChanges.subscribe(tipo => {
      const codigo = this.tipoSolicitudToCodigo[tipo] || "";
      this.formTramiteMPV.get("codigo")?.setValue(codigo, { emitEvent: false });

      this.descripcionTipoArbitraje = this.descripciones[tipo] || null;
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      this.archivos.push(file);
    });

    input.value = '';
  }

  eliminarArchivo(index: number) {
    this.archivos.splice(index, 1);
  }

  verArchivo(file: File) {
    const url = URL.createObjectURL(file);

    window.open(url, '_blank');

    // Liberar memoria después de un pequeño delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  /* ----------------------------- STEPS ----------------------------- */
  // Pasar al siguiente paso si es válido
  nextStep() {

    // const controles = this.getControlesPorStep();

    // if (!this.isStepValido()) {
    //   controles.forEach(c => {
    //     this.formTramiteMPV.get(c)?.markAsTouched();
    //   });
    //   return;
    // }
    // this.currentStep++;

    if (this.currentStep < 5) this.currentStep++;
  }

  // Retroceder al paso anterior
  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  // Ir a un paso específico (opcional)
  irAlPaso(paso: number) {
    this.currentStep = paso;
  }

  goToStep(step: number) {
    this.currentStep = step;
  }

  // =========================
  // RESET COMPLETO
  // =========================
  resetProceso() {
    this.tramiteFormService.reset();
    this.currentStep = 1;
  }



  /* ------------------ VALIDACIÓN ------------------ */
  private obtenerNombreCampo(campo: string): string {
    const nombres: any = {
      // Para demandante
      nombre: 'Nombre',
      apellidos: 'Apellidos',
      correo: 'Correo Electrónico',
      direccion: "Dirección",
      telefono: 'Teléfono',
      documento_identidad: 'DNI / RUC',

      // Para demandado
      tipo_demandado: 'Tipo de Demandado',
      nombre_demandado: 'Nombre del Demandado',
      apellidos_demandado: 'Apellidos del Demandado',
      correo_demandado: 'Correo del Demandado',
      direccion_demandado: 'Dirección del Demandado',
      telefono_demandado: 'Teléfono del Demandado',
      tipo_documento_demandado: 'Tipo de Documento del Demandado',
      doc_identidad_demandado: 'DNI / RUC del Demandado',
      documento_demandado: 'Documento del Demandado',

      // Para solicitud
      tipo_solicitud: 'Tipo de Solicitud',
      descripcion: 'Descripción',
      codigo: 'Código del Expediente',
      fileInput: 'Archivo Adjunto'
    };

    return nombres[campo] || campo;
  }


  // Validar los campos de cada step
  private validarStepActual(): boolean {
    const controles = this.getControlesPorStep();
    const grupo = this.formTramiteMPV;

    controles.forEach(c => grupo.get(c)?.markAsTouched());

    const invalidos = controles.filter(c => grupo.get(c)?.invalid);

    if (invalidos.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        html: `
        <p class="text-left">Por favor completa los siguientes campos:</p>
        <ul class="text-left mt-3">
          ${invalidos.map(c => `<li>• <b>${this.obtenerNombreCampo(c)}</b></li>`).join('')}
        </ul>
      `,
        confirmButtonColor: '#3085d6'
      });
      return false;
    }

    return true;
  }

  isStepValido(): boolean {
    const controles = this.getControlesPorStep();

    const formValido = controles.every(c => {
      const control = this.formTramiteMPV.get(c);
      return control?.valid;
    });

    //  Validación adicional para STEP 4
    if (this.currentStep === 4) {
      return formValido && this.archivos.length > 0;
    }

    return formValido;
  }

  private getControlesPorStep(): string[] {

    if (this.currentStep === 1) {
      const tipo = this.formTramiteMPV.get('tipo')?.value;

      const base = [
        'tipo',
        'direccion',
        'correo'
      ];

      if (tipo === 'natural') {
        return [
          ...base,
          'nombre',
          'apellidos',
          'dni'
        ];
      }

      if (tipo === 'juridica') {
        return [
          ...base,
          'nombre',
          'apellidos',
          'dni',
          'ruc',
          'razon_social'
        ];
      }

      if (tipo === 'entidad_publica') {
        return [
          ...base,
          'ruc',
          'nombre_entidad'
        ];
      }

      return base;
    }

    if (this.currentStep === 2) {
      const tipo = this.formTramiteMPV.get('tipoDemandado')?.value;

      const base = [
        'tipoDemandado',
        'direccionDemandado',
        'correoDemandado'
      ];

      if (tipo === 'natural') {
        return [
          ...base,
          'nombreDemandado',
          'apellidosDemandado',
          'dniDemandado'
        ];
      }

      if (tipo === 'juridica') {
        return [
          ...base,
          'nombreDemandado',
          'apellidosDemandado',
          'dniDemandado',
          'rucDemandado',
          'razon_socialDemandado'
        ];
      }

      if (tipo === 'entidad_publica') {
        return [
          ...base,
          'rucDemandado',
          'nombre_entidadDemandado'
        ];
      }

      return base;
    }

    if (this.currentStep === 3) {
      const base = [
        'tipo_solicitud',
        'codigo',
      ];
      return base;
    }

    if (this.currentStep === 4) {
      return ['descripcion'];
    }

    return [];
  }


  get f() {
    return this.formTramiteMPV.controls;
  }

  getResumen() {
    return this.formTramiteMPV.getRawValue();
  }

  /* ----------------------------- REGISTRAR ----------------------------- */
  enviar() {
    if (this.formTramiteMPV.invalid) {

      console.log("enviando...")
      return this.formTramiteMPV.markAllAsTouched();
    }

    const fd = new FormData();

    //  1. Construir JSON limpio del formulario
    const tramiteData: any = {};

    Object.entries(this.formTramiteMPV.value).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        key !== 'fileInput'
      ) {
        tramiteData[key] = value;
      }
    });

    this.enviado = true;

    // CON ARCHIVOS
    fd.append('data', JSON.stringify(tramiteData));

    this.archivos.forEach((file) => {
      fd.append('archivos', file, file.name);
    });

    console.log("ARCHIVOS", this.archivos);


    // Mostramos un loader mientras se envía
    Swal.fire({
      title: 'Enviando solicitud...',
      text: 'Por favor espera mientras procesamos tu trámite.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.tramiteService.newTramite(fd).subscribe({
      next: (response) => {
        this.respuesta = response; //  guarda respuesta



        Swal.fire({
          title: 'Trámite registrado correctamente',
          html: `
        <div class="text-left">
          <p><strong>Número de trámite:</strong> ${response.tramite.numero_tramite}</p>
          <p><strong>Estado:</strong> ${response.tramite.estado} </p>
          <p><strong>Mensaje:</strong> Sirvase revisar su correo electrónico para más instrucciones</p>
        </div>
      `,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#198754',
        });
        this.enviado = true;

        this.resetFormulario();
      },
      error: (err) => {
        this.enviado = false;

        Swal.fire({
          icon: 'error',
          title: 'Error al registrar la solicitud',
          text: err?.error?.message || 'Ocurrió un error al procesar tu trámite.',
          confirmButtonColor: '#d33'
        });

      }
    });
  }

  resetFormulario() {

    this.formTramiteMPV.reset({
      // =========================
      // STEP 1 — INTERESADO
      // =========================
      tipo: 'natural',
      nombre: '',
      apellidos: '',
      dni: '',
      correo: '',
      direccion: '',
      cargo: '',
      telefono: '',
      ruc: '',
      razon_social: '',
      nombre_entidad: '',

      // =========================
      // STEP 2 — DEMANDADO
      // =========================
      tipoDemandado: 'natural',
      nombreDemandado: '',
      apellidosDemandado: '',
      dniDemandado: '',
      correoDemandado: '',
      direccionDemandado: '',
      cargoDemandado: '',
      telefonoDemandado: '',
      rucDemandado: '',
      razon_socialDemandado: '',
      nombre_entidadDemandado: '',

      // =========================
      // STEP 3 — ARBITRAJE
      // =========================
      tipo_solicitud: '',
      codigo: '',

      // =========================
      // STEP 4 — CONTROL
      // =========================
      fecha_registro: this.fechaActual,
      descripcion: ''
    });

    // Reset estado UI
    this.formTramiteMPV.markAsPristine();
    this.formTramiteMPV.markAsUntouched();

    // Limpiar archivos
    this.archivos = [];

    // Reset flags
    this.enviado = false;

  }

  onTipoUsuarioChange(event: any) {
    const tipo = this.formTramiteMPV.get('tipo')?.value;
    this.tipoUsuarioSeleccionado = tipo;

    const nombreCtrl = this.formTramiteMPV.get('nombre');
    const apellidosCtrl = this.formTramiteMPV.get('apellidos');
    const dniCtrl = this.formTramiteMPV.get('dni');

    const razonSocialCtrl = this.formTramiteMPV.get('razon_social');
    const rucCtrl = this.formTramiteMPV.get('ruc');
    const nombreEntidadCtrl = this.formTramiteMPV.get('nombre_entidad');

    // Limpiar todo primero
    const controles = [
      nombreCtrl,
      apellidosCtrl,
      dniCtrl,
      razonSocialCtrl,
      rucCtrl,
      nombreEntidadCtrl
    ];

    // Limpiar validaciones y valores
    controles.forEach(ctrl => {
      ctrl?.setValue(null);
      ctrl?.clearValidators();
      ctrl?.markAsTouched();
    });


    // Reglas
    if (tipo === 'natural') {

      nombreCtrl?.setValidators([Validators.required]);
      apellidosCtrl?.setValidators([Validators.required]);
      dniCtrl?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8)
      ]);

    } else if (tipo === 'juridica') {

      nombreCtrl?.setValidators([Validators.required]);
      apellidosCtrl?.setValidators([Validators.required]);
      dniCtrl?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8)
      ]);
      razonSocialCtrl?.setValidators([Validators.required]);
      rucCtrl?.setValidators([
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11)
      ]);
    } else if (tipo === 'entidad_publica') {

      nombreEntidadCtrl?.setValidators([Validators.required]);
      rucCtrl?.setValidators([
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11)
      ]);
    }

    // Actualizar cada control
    controles.forEach(ctrl => {
      ctrl?.updateValueAndValidity({ emitEvent: false });
    });

    // Actualizar TODO el form
    this.formTramiteMPV.updateValueAndValidity();
  }

  onTipoUsuarioDemandadoChange($event: any) {
    const tipoDemandado = this.formTramiteMPV.get('tipoDemandado')?.value;
    this.tipoUsuarioDemandado = tipoDemandado;

    const nombreDemandadoCtrl = this.formTramiteMPV.get('nombreDemandado');
    const apellidosDemandadoCtrl = this.formTramiteMPV.get('apellidosDemandado');
    const dniDemandadoCtrl = this.formTramiteMPV.get('dniDemandado');

    const razonSocialDemandadoCtrl = this.formTramiteMPV.get('razon_socialDemandado');
    const rucDemandadoCtrl = this.formTramiteMPV.get('rucDemandado');
    const nombreEntidadDemandadoCtrl = this.formTramiteMPV.get('nombre_entidadDemandado');

    // Limpiar todo primero
    const controles = [
      nombreDemandadoCtrl,
      apellidosDemandadoCtrl,
      dniDemandadoCtrl,
      razonSocialDemandadoCtrl,
      rucDemandadoCtrl,
      nombreEntidadDemandadoCtrl
    ];

    controles.forEach(ctrl => {
      ctrl?.reset();
      ctrl?.clearValidators();
    });

    // ============================
    // REGLAS
    // ============================

    if (tipoDemandado === 'natural') {

      nombreDemandadoCtrl?.setValidators([Validators.required]);
      apellidosDemandadoCtrl?.setValidators([Validators.required]);
      dniDemandadoCtrl?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8)
      ]);

    } else if (tipoDemandado === 'juridica') {

      nombreDemandadoCtrl?.setValidators([Validators.required]);
      apellidosDemandadoCtrl?.setValidators([Validators.required]);
      dniDemandadoCtrl?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8)
      ]);
      razonSocialDemandadoCtrl?.setValidators([Validators.required]);
      rucDemandadoCtrl?.setValidators([
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11)
      ]);
    } else if (tipoDemandado === 'entidad_publica') {

      nombreEntidadDemandadoCtrl?.setValidators([Validators.required]);
      rucDemandadoCtrl?.setValidators([
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11)
      ]);
    }

    // Actualizar validaciones
    controles.forEach(ctrl => {
      ctrl?.updateValueAndValidity();
    });
  }

  // Helpers method
  esRequerido(campo: string): boolean {
    const control = this.formTramiteMPV.get(campo);
    return control?.hasValidator(Validators.required) ?? false;
  }

}
