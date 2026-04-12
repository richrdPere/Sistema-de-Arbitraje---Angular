import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Pipes
import { FileSizePipe } from 'src/app/pipes/size-file.pipe';
import { TruncatePipe } from 'src/app/pipes/truncate.pipe';

// Service
import { TramiteMPVFormService } from 'src/app/services/tramiteMPV-form.service';

@Component({
  selector: 'step-archivos',
  imports: [ReactiveFormsModule, CommonModule, UppercaseDirective, FileSizePipe, TruncatePipe,],
  templateUrl: './step-archivos.component.html',
  styles: ``
})
export class StepArchivosComponent implements OnInit {

  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  form!: FormGroup;

  archivos: File[] = [];

  constructor(
    private fb: FormBuilder,
    private tramiteService: TramiteMPVFormService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      descripcion: ['', Validators.required]
    });
  }

  // =========================
  // ARCHIVOS
  // =========================
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      this.archivos.push(file);
    });

    input.value = '';
  }

  verArchivo(file: File) {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  eliminarArchivo(index: number) {
    this.archivos.splice(index, 1);
  }

  // =========================
  // NAVEGACIÓN
  // =========================
  continuar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Guardar en service
    this.tramiteService.setArchivos(this.archivos);

    // Descripción va en solicitud
    const data = this.tramiteService.getFormData();
    this.tramiteService.setSolicitud({
      ...data.solicitud,
      descripcion: this.form.value.descripcion
    });

    this.nextStep.emit();
  }

  volver() {
    this.prevStep.emit();
  }
}
