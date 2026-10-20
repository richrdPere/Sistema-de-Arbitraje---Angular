import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

// Directives
import {
  UppercaseDirective,
} from 'src/app/shared/directives/uppercase.directive';

// Pipes
import {
  FileSizePipe,
} from 'src/app/shared/pipes/size-file.pipe';

import {
  TruncatePipe,
} from 'src/app/shared/pipes/truncate.pipe';

// Service
import {
  MesaPartesFormService,
} from 'src/app/pages/features/solicitudes/services/mesa-partes-form.service';

const textoObligatorio: ValidatorFn = (control) =>
  typeof control.value === 'string' &&
    control.value.trim().length > 0
    ? null
    : { required: true };

@Component({
  selector: 'step-archivos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UppercaseDirective,
    FileSizePipe,
    TruncatePipe,
  ],
  templateUrl: './step-archivos.component.html',
  styles: ``,
})
export class StepArchivosComponent implements OnInit, OnDestroy {

  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  form!: FormGroup;
  archivos: File[] = [];

  private readonly urlsArchivos = new Set<string>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly mesaPartesFormService: MesaPartesFormService,
  ) { }

  // *********************************************************
  // INICIALIZACIÓN
  // *********************************************************
  ngOnInit(): void {
    this.form = this.fb.group({
      descripcion: [
        '',
        [
          Validators.required,
          textoObligatorio,
        ],
      ],
    });

    this.loadData();
  }

  // *********************************************************
  // RESTAURAR BORRADOR
  // *********************************************************
  loadData(): void {
    const data = this.mesaPartesFormService.getFormData();

    this.archivos = [...(data.archivos || [])];

    this.form.patchValue({
      descripcion: data.solicitud?.descripcion ?? '',
    });
  }

  // *********************************************************
  // SELECCIONAR ARCHIVOS
  // *********************************************************
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    for (const archivo of Array.from(input.files)) {
      const existe = this.archivos.some(
        (actual) =>
          actual.name === archivo.name &&
          actual.size === archivo.size &&
          actual.lastModified === archivo.lastModified,
      );

      if (!existe) {
        this.archivos.push(archivo);
      }
    }

    this.mesaPartesFormService.setArchivos([
      ...this.archivos,
    ]);

    input.value = '';
  }

  // *********************************************************
  // VER ARCHIVO
  // *********************************************************
  verArchivo(file: File): void {
    const url = URL.createObjectURL(file);

    this.urlsArchivos.add(url);

    window.open(
      url,
      '_blank',
      'noopener,noreferrer',
    );
  }

  // *********************************************************
  // ELIMINAR ARCHIVO
  // *********************************************************
  eliminarArchivo(index: number): void {
    if (index < 0 || index >= this.archivos.length) {
      return;
    }

    this.archivos.splice(index, 1);

    this.mesaPartesFormService.setArchivos([
      ...this.archivos,
    ]);
  }

  // *********************************************************
  // GUARDAR BORRADOR
  // *********************************************************
  private guardarDatos(): void {
    const data = this.mesaPartesFormService.getFormData();

    this.mesaPartesFormService.setArchivos([
      ...this.archivos,
    ]);

    this.mesaPartesFormService.setSolicitud({
      ...data.solicitud,

      descripcion: String(
        this.form.get('descripcion')?.value ?? '',
      ).trim(),
    });
  }

  // *********************************************************
  // NAVEGACIÓN
  // *********************************************************
  continuar(): void {
    const descripcion = this.form.get('descripcion');

    descripcion?.setValue(
      String(descripcion.value ?? '').trim(),
      {
        emitEvent: false,
      },
    );

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardarDatos();
    this.nextStep.emit();
  }

  volver(): void {
    this.guardarDatos();
    this.prevStep.emit();
  }

  // *********************************************************
  // LIBERAR URLS
  // *********************************************************
  ngOnDestroy(): void {
    for (const url of this.urlsArchivos) {
      URL.revokeObjectURL(url);
    }

    this.urlsArchivos.clear();
  }
}

// import { CommonModule } from '@angular/common';
// import { Component, OnInit, Output, EventEmitter } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// // Directives
// import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';

// // Pipes
// import { FileSizePipe } from 'src/app/shared/pipes/size-file.pipe';
// import { TruncatePipe } from 'src/app/shared/pipes/truncate.pipe';

// // Service
// import { TramiteMPVFormService } from 'src/app/pages/features/solicitudes/services/mesa-partes-form.service';

// @Component({
//   selector: 'step-archivos',
//   imports: [ReactiveFormsModule, CommonModule, UppercaseDirective, FileSizePipe, TruncatePipe,],
//   templateUrl: './step-archivos.component.html',
//   styles: ``
// })
// export class StepArchivosComponent implements OnInit {

//   @Output() nextStep = new EventEmitter<void>();
//   @Output() prevStep = new EventEmitter<void>();

//   form!: FormGroup;

//   archivos: File[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private tramiteService: TramiteMPVFormService
//   ) { }

//   ngOnInit(): void {
//     this.form = this.fb.group({
//       descripcion: ['', Validators.required]
//     });
//   }

//   // =========================
//   // ARCHIVOS
//   // =========================
//   onFileSelect(event: Event) {
//     const input = event.target as HTMLInputElement;
//     if (!input.files) return;

//     Array.from(input.files).forEach(file => {
//       this.archivos.push(file);
//     });

//     input.value = '';
//   }

//   verArchivo(file: File) {
//     const url = URL.createObjectURL(file);
//     window.open(url, '_blank');

//     setTimeout(() => {
//       URL.revokeObjectURL(url);
//     }, 1000);
//   }

//   eliminarArchivo(index: number) {
//     this.archivos.splice(index, 1);
//   }

//   // =========================
//   // NAVEGACIÓN
//   // =========================
//   continuar() {
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     // Guardar en service
//     this.tramiteService.setArchivos(this.archivos);

//     // Descripción va en solicitud
//     const data = this.tramiteService.getFormData();
//     this.tramiteService.setSolicitud({
//       ...data.solicitud,
//       descripcion: this.form.value.descripcion
//     });

//     this.nextStep.emit();
//   }

//   volver() {
//     this.prevStep.emit();
//   }
// }
