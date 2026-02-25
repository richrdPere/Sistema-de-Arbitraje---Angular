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

@Component({
  selector: 'app-mesa-partes',
  imports: [ReactiveFormsModule, FileSizePipe, TruncatePipe, UppercaseDirective, CommonModule],
  templateUrl: './mesa_partes.component.html',
})
export class MesaPartesComponent implements OnInit {

  // fechaActual = new Date().toLocaleDateString('en-CA');
  fechaActual: string = '';

  numeroSolicitud: string = '';

  colorAlerta: string = 'rgb(0, 32, 91)';

  // STEP CONTROL
  currentStep: number = 1;
  isEntidad: boolean = false;

  formTramiteMPV: FormGroup;
  file: File | null = null;
  enviado = false;
  respuesta: any;
  mensajeExito: string = '';
  mensajeError: string = '';

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


  constructor(private fb: FormBuilder, private tramiteService: TramiteMPVService, private validacionesService: ValidacionesService) {
    this.formTramiteMPV = this.fb.group({

      // =========================
      // STEP 1 — DATOS DEL INTERESADO
      // =========================
      tipo_documento: ['', Validators.required],
      documento_identidad: ['', Validators.required],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      tipo_usuario: ['', Validators.required],
      correo: ['',
        [Validators.required, Validators.email],
        [this.validacionesService.validarCorreo()]
      ],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      cargo: [''],

      // =========================
      // STEP 2 — DATOS DEL ARBITRAJE
      // =========================
      tipo_solicitud: ['', Validators.required],
      codigo: ['', Validators.required], // viene desde el sistema


      // =========================
      // STEP 3 — CONTROL INTERNO
      // =========================
      fecha_registro: [this.fechaActual],
      descripcion: ['', Validators.required],

      /* ARCHIVO */
      // fileInput: [null, Validators.required]
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
        // descripcion: this.descripciones[tipo]
      });

      this.descripcionTipoArbitraje = this.descripciones[tipo];
    });

    this.dniRucDemandante();
    this.autoAsignarCodigo();

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

    const tipoCtrl = this.formTramiteMPV.get("tipo_documento");
    const documentoCtrl = this.formTramiteMPV.get("documento_identidad");

    if (!tipoCtrl || !documentoCtrl) return;

    tipoCtrl.valueChanges.subscribe(tipo => {

      let maxLength = 0;
      let asyncValidator = null;

      if (tipo === "DNI") {
        this.placeholderDocumento = 'Ingrese el numero de su DNI';
        maxLength = 8;
        asyncValidator = this.validacionesService.validarDni();
      }

      if (tipo === "RUC") {
        this.placeholderDocumento = 'Ingrese el numero de su RUC';
        maxLength = 11;
        asyncValidator = this.validacionesService.validarRuc();
      }

      this.maxDocumentoDemandante = maxLength;

      // 🔥 Limpiar validadores anteriores
      documentoCtrl.clearValidators();
      documentoCtrl.clearAsyncValidators();

      // 🔥 Asignar nuevos validadores
      documentoCtrl.setValidators([
        Validators.required,
        Validators.minLength(maxLength),
        Validators.maxLength(maxLength),
        Validators.pattern(/^[0-9]+$/)
      ]);

      if (asyncValidator) {
        documentoCtrl.setAsyncValidators(asyncValidator);
      }

      documentoCtrl.reset();
      documentoCtrl.updateValueAndValidity();
    });
  }

  // dniRucDemandante(): void {
  //   this.formTramiteMPV.get("tipo_documento")?.valueChanges.subscribe(tipo => {

  //     const documentoCtrl = this.formTramiteMPV.get("documento_identidad");

  //     if (!documentoCtrl) return;

  //     let maxLength = 0;
  //     let asyncValidator;

  //     if (tipo === "DNI") {

  //       this.placeholderDocumento = 'Ingrese el numero de su DNI';
  //       maxLength = 8;

  //       asyncValidator = this.validacionesService.validarDni();

  //     } else if (tipo === "RUC") {

  //       this.placeholderDocumento = 'Ingrese el numero de su RUC';
  //       maxLength = 11;

  //       asyncValidator = this.validacionesService.validarRuc();

  //     }

  //     this.maxDocumentoDemandante = maxLength;

  //     documentoCtrl.setValidators([
  //       Validators.required,
  //       Validators.maxLength(maxLength),
  //       Validators.minLength(maxLength),
  //       Validators.pattern(/^[0-9]*$/)
  //     ]);

  //     documentoCtrl.setAsyncValidators([asyncValidator]);

  //     documentoCtrl.reset();
  //     documentoCtrl.updateValueAndValidity();


  //     // if (tipo === "DNI") {
  //     //   this.placeholderDocumento = 'Ingrese el numero de su DNI';
  //     //   this.maxDocumentoDemandante = 8;
  //     //   this.formTramiteMPV.get("documento_identidad")?.setValidators([
  //     //     Validators.required,
  //     //     Validators.maxLength(8),
  //     //     Validators.minLength(8),
  //     //     Validators.pattern(/^[0-9]*$/)
  //     //   ]);
  //     // } else if (tipo === "RUC") {
  //     //   this.placeholderDocumento = 'Ingrese el numero de su RUC';
  //     //   this.maxDocumentoDemandante = 11;
  //     //   this.formTramiteMPV.get("documento_identidad")?.setValidators([
  //     //     Validators.required,
  //     //     Validators.maxLength(11),
  //     //     Validators.minLength(11),
  //     //     Validators.pattern(/^[0-9]*$/)
  //     //   ]);
  //     // }

  //     // // Actualizar validaciones
  //     // this.formTramiteMPV.get('documento_identidad')?.reset();
  //   });
  // }

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

    if (!this.isStepValido()) {
      this.getControlesPorStep().forEach(c => {
        this.formTramiteMPV.get(c)?.markAsTouched();
      });
      return;
    }
    this.currentStep++;
  }

  // Retroceder al paso anterior
  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  // Ir a un paso específico (opcional)
  irAlPaso(paso: number) {
    this.currentStep = paso;
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
      return control && control.valid && control.value !== null && control.value !== '';
    });

    //  Validación adicional para STEP 3
    if (this.currentStep === 3) {
      return formValido && this.archivos.length > 0;
    }

    return formValido;
  }

  private getControlesPorStep(): string[] {

    if (this.currentStep === 1) {
      return [
        'nombre',
        'apellidos',
        'correo',
        'direccion',
        'telefono',
        'tipo_documento',
        'documento_identidad',
        'tipo_usuario',
        'cargo'
      ];
    }

    if (this.currentStep === 2) {
      const base = [
        'tipo_solicitud',
        'codigo',
      ];
      return base;
    }

    if (this.currentStep === 3) {
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
    if (this.formTramiteMPV.invalid) return this.formTramiteMPV.markAllAsTouched();

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

    //  2. Enviar JSON como string
    fd.append('data', JSON.stringify(tramiteData));

    //  3. Enviar archivos
    this.archivos.forEach((file) => {
      fd.append('archivos', file, file.name);
    });

    //  4. DEBUG REAL (esto SÍ muestra el contenido)

    this.enviado = true;

    // Mostramos un loader mientras se envía
    Swal.fire({
      title: 'Enviando solicitud...',
      text: 'Por favor espera mientras procesamos tu trámite.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.tramiteService.registrarTramite(fd).subscribe({
      next: (response) => {
        this.respuesta = response; //  guarda respuesta



        Swal.fire({
          title: 'Trámite registrado correctamente',
          html: `
        <div class="text-left">
          <p><strong>Número de trámite:</strong> ${response.tramite.numero_tramite}</p>
          <p><strong>Estado:</strong> ${response.tramite.estado}</p>
        </div>
      `,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#198754',
        });
        this.enviado = true;

        // this.mensajeExito = ` ${response.message}`;

        this.formTramiteMPV.reset();
        this.archivos = [];
        this.enviado = false;
        // this.file = null;
      },
      error: (err) => {
        this.enviado = false;
        this.mensajeError = ' Error al registrar la solicitud.';
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar la solicitud',
          text: err?.error?.message || 'Ocurrió un error al procesar tu trámite.',
          confirmButtonColor: '#d33'
        });

      }
    });
  }

}
