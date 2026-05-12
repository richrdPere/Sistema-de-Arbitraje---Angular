import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Service
import { ParticipeService } from 'src/app/services/admin/participes.service';
import { ValidacionesService } from 'src/app/pages/shared/services/validaciones.service';
import { PersonaService } from 'src/app/services/persona.service';

// Interface
import { Participe } from 'src/app/interfaces/users/participeUser';


@Component({
  selector: 'participe-modal',
  imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
  templateUrl: './participe-modal.component.html',
  styles: ``
})
export class ParticipeModalComponent implements OnInit, OnChanges {
  @Input() mostrarModal = false;
  @Input() modoEdicion = false; // ← Nuevo flag
  @Input() personaSeleccionado: any = null; // ← Datos al editar

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() personaCreado = new EventEmitter<void>();

  modalWidthClass = 'max-w-4xl'; // default

  setModalWidth(size: 'sm' | 'md' | 'lg' | 'xl' | 'full') {
    const map = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full w-[95vw]'
    };

    this.modalWidthClass = map[size];
  }

  placeholderDocumento = 'Seleccione tipo de documento';
  maxDocumentoDemandante = 8; // valor por defecto

  formParticipe!: FormGroup;
  isEntidad: boolean = false;

  cargando = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private fb: FormBuilder,
    private participeService: ParticipeService,
    private validacionesService: ValidacionesService
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.setModalWidth('lg');

    this.dniRucDemandante();


  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si estamos en modo edición, llenamos el formulario
    if (!this.formParticipe) return; // Si el formulario no está inicializado, salir

    // Detecta cuando cambian los inputs
    if (changes['participeSeleccionado']) {
      if (this.personaSeleccionado) {
        // this.modoEdicion = true;

        this.formParticipe.reset(); //  siempre limpia antes
        this.patchFormParticipe();
      } else {
        this.modoEdicion = false;
        this.formParticipe.reset();
      }
    }
  }


  inicializarFormulario(): void {
    this.formParticipe = this.fb.group({

      tipo: ['', Validators.required],

      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      dni: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email], [this.validacionesService.validarCorreo()]],
      direccion: ['', Validators.required],
      cargo: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      ruc: [''],
      razon_social: [''],
      nombre_entidad: [''],

      tipo_documento: [null, [Validators.required]],
      tipo_usuario: [null, Validators.required],
      documento_identidad: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],

      rol_participe: [null, Validators.required],

    });
  }

  private patchFormParticipe(): void {

    const usuarioId = this.personaSeleccionado.usuario?.id;

    this.formParticipe.patchValue({
      nombre: this.personaSeleccionado.usuario?.nombre || '',
      apellidos: this.personaSeleccionado.usuario?.apellidos || '',
      correo: this.personaSeleccionado.usuario?.correo || '',
      telefono: this.personaSeleccionado.usuario?.telefono || '',
      tipo_documento: this.personaSeleccionado.usuario?.tipo_documento || '',
      documento_identidad: this.personaSeleccionado.usuario?.documento_identidad || '',
      tipo_usuario: this.personaSeleccionado.tipo_usuario || '',
      cargo: this.personaSeleccionado.cargo || '',
      rol_participe: this.personaSeleccionado.rol_participe || '',
    });

    const correoCtrl = this.formParticipe.get('correo');

    if (this.modoEdicion) {
      correoCtrl?.disable({ emitEvent: false });
      correoCtrl?.clearAsyncValidators();
      correoCtrl?.setErrors(null);
    } else {
      correoCtrl?.enable({ emitEvent: false });
      correoCtrl?.setAsyncValidators(
        this.validacionesService.validarCorreo(usuarioId)
      );
    }

    this.formParticipe.updateValueAndValidity({ emitEvent: false });

    // Reasignar validadores de documento con exclusión
    this.formParticipe.get('documento_identidad')
      ?.setAsyncValidators(
        this.formParticipe.get('tipo_documento')?.value === 'DNI'
          ? this.validacionesService.validarDni(usuarioId)
          : this.validacionesService.validarRuc(usuarioId)
      );

    this.formParticipe.updateValueAndValidity({ emitEvent: false });
  }

  dniRucDemandante(): void {

    const tipoCtrl = this.formParticipe.get("tipo_documento");
    const documentoCtrl = this.formParticipe.get("documento_identidad");

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

  //  Enviar formulario
  crearOEditarParticipe(): void {
    if (this.formParticipe.invalid) {
      this.mensajeError = 'Por favor completa todos los campos requeridos.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const participe: any = { ...this.formParticipe.value }

    if (this.modoEdicion && this.personaSeleccionado?.id_participe) {

      // ============================
      // MODO EDICIÓN
      // ============================
      const id = this.personaSeleccionado?.id_participe;

      this.participeService.actualizarParticipe(id, participe).subscribe({
        next: () => {
          this.cargando = false;
          Swal.fire('Actualizado', 'El partícipe fue actualizado correctamente.', 'success');
          this.mensajeExito = ' Partícipe creado exitosamente.';

          // Notificar al componente padre que se creó un partícipe
          this.personaCreado.emit();

          // Cerrar el modal tras un pequeño delay
          setTimeout(() => {
            this.cerrarModal();
          }, 1000);
        },
        error: (err) => {
          this.cargando = false;
          this.mensajeError = err.error?.message || ' Error al crear el partícipe.';
          Swal.fire('Error', 'No se pudo actualizar el partícipe.', 'error');
        },
      });

      return;
    }

    // ============================
    // MODO CREACIÓN
    // ============================

    console.log('Creando partícipe con datos:', participe);

    this.participeService.crearParticipe(participe).subscribe({
      next: () => {
        this.cargando = false;
        Swal.fire('Creado', 'Partícipe creado exitosamente.', 'success');
        this.personaCreado.emit();
        this.cerrarModal();
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.message || 'Error al crear el partícipe.';
      },
    });
  }

  onTipoDemandadoChange() {
    const tipo = this.formParticipe.get('tipo_usuario')?.value;

    this.isEntidad = tipo === 'entidad_publica';

    // const nombre = this.formParticipe.get('nombre');
    const apellidos = this.formParticipe.get('apellidos');

    if (this.isEntidad) {
      // Limpia campos de persona
      apellidos?.clearValidators();
      apellidos?.setValue('DATO NO PROPORCIONADO');
      // apellidos?.updateValueAndValidity();
    } else {
      // Limpia el campo de entidad
      apellidos?.setValidators([Validators.required, Validators.minLength(3)]);
      apellidos?.setValue('');
      // apellidos?.updateValueAndValidity();

    }

    apellidos?.updateValueAndValidity();
  }

  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;

    this.formParticipe.enable(); //  MUY IMPORTANTE
    this.formParticipe.reset();

    this.modalCerrado.emit();
  }

  get f() {
    return this.formParticipe.controls;
  }

  esRequerido(campo: string): boolean {
    const control = this.formParticipe.get(campo);
    return control?.hasValidator(Validators.required) ?? false;
  }

}
