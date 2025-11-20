import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';

@Component({
  selector: 'app-mesa-partes',
  imports: [ReactiveFormsModule],
  templateUrl: './mesa_partes.component.html',
})
export class MesaPartesComponent {

  // STEP CONTROL
  currentStep: number = 1;
  isEntidad: boolean = false;

  formTramiteMPV: FormGroup;
  file: File | null = null;
  enviado = false;
  respuesta: any;
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(private fb: FormBuilder, private tramiteService: TramiteMPVService) {
    this.formTramiteMPV = this.fb.group({

      // STEP 1 — Datos del Demandante
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      direccion: ['', [Validators.required]],
      telefono: ['', Validators.required],
      tipo_documento: ['', [Validators.required]],
      documento_identidad: ['', Validators.required],

      // STEP 2 — Datos del Demandado
      tipo_demandado: ['', Validators.required],
      nombre_demandado: ['', Validators.required],
      apellidos_demandado: ['', Validators.required],
      correo_demandado: ['', [Validators.required, Validators.email]],
      direccion_demandado: ['', [Validators.required]],
      telefono_demandado: ['', Validators.required],
      tipo_documento_demandado: ['', [Validators.required]],
      doc_identidad_demandado: ['', Validators.required],


      // STEP 3 — Tipo de solicitud
      tipo_solicitud: ['', Validators.required],
      descripcion: ['', Validators.required],
      codigo: ['', Validators.required], // viene desde el sistema

      /* ARCHIVO */
      fileInput: [null, Validators.required]
    });
  }

  /* ----------------------------- FILE ----------------------------- */
  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.file = input.files[0];
    this.formTramiteMPV.patchValue({ fileInput: this.file });
  }

  /* ------------------------ TIPO DEMANDADO ------------------ */
  onTipoDemandadoChange() {
    const tipo = this.formTramiteMPV.get('tipo_demandado')?.value;

    this.isEntidad = tipo === 'entidad';

    const nombre = this.formTramiteMPV.get('nombre_demandado');
    const apellidos = this.formTramiteMPV.get('apellidos_demandado');

    if (this.isEntidad) {
      // Limpia campos de persona
      apellidos?.clearValidators();
      apellidos?.setValue('');
      apellidos?.updateValueAndValidity();
      // this.formTramiteMPV.patchValue({
      //   nombre_demandado: '',
      //   apellidos_demandado: ''
      // });
    } else {
      // Limpia el campo de entidad
      apellidos?.setValidators([Validators.required]);
      apellidos?.updateValueAndValidity();
      // this.formTramiteMPV.patchValue({
      //   nombre_demandado: ''
      // });
    }

    nombre?.setValidators([Validators.required]);
    nombre?.updateValueAndValidity();
  }


  /* ----------------------------- STEPS ----------------------------- */
  // Pasar al siguiente paso si es válido
  nextStep() {
    // if (!this.validarStepActual()) return;
    // if (this.currentStep < 3) this.currentStep++;
    if (this.validarStepActual()) {
      this.currentStep++;
    }
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
      // documento_demandado: 'Documento del Demandado',

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
    let controles: string[] = [];

    if (this.currentStep === 1) {
      controles = [
        'nombre', 'apellidos', 'correo', 'direccion',
        'telefono', 'tipo_documento', 'documento_identidad'
      ];
    }

    if (this.currentStep === 2) {
      controles = [
        'tipo_demandado',
        'nombre_demandado',
        'correo_demandado',
        'direccion_demandado',
        'telefono_demandado',
        'tipo_documento_demandado',
        'doc_identidad_demandado'
      ];

      if (!this.isEntidad) {
        controles.push('apellidos_demandado');
      }
    }

    if (this.currentStep === 3) {
      controles = ['tipo_solicitud', 'descripcion', 'codigo', 'fileInput'];
    }

    const grupo = this.formTramiteMPV;

    // Marcar campos como tocados
    controles.forEach(control => grupo.get(control)?.markAsTouched());

    // Buscar inválidos
    const invalidos = controles.filter(c => !grupo.get(c)?.valid);


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

    // return controles.every(control => grupo.get(control)?.valid);
  }

  /* ----------------------------- REGISTRAR ----------------------------- */
  enviar() {
    if (this.formTramiteMPV.invalid) return this.formTramiteMPV.markAllAsTouched();

    if (this.formTramiteMPV.invalid || !this.file) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos y adjunta un archivo antes de enviar.',
        confirmButtonColor: '#3085d6'
      });
      return this.formTramiteMPV.markAllAsTouched();
    }

    const fd = new FormData();
    Object.entries(this.formTramiteMPV.value).forEach(([key, value]) => {
      // fd.append(key, value as string);
      if (key !== 'fileInput') {
        fd.append(key, value as string);
      }
    });
    if (this.file) fd.append('file', this.file, this.file.name);
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
        this.enviado = true;

        Swal.fire({
          icon: 'success',
          title: '¡Solicitud enviada!',
          text: response.message || 'Tu trámite fue registrado correctamente.',
          confirmButtonColor: '#16a34a'
        });

        // this.mensajeExito = ` ${response.message}`;
        console.log('Trámite registrado:', response.tramite);
        this.formTramiteMPV.reset();
        this.file = null;
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
        console.error(err);
      }
    });
  }

}
