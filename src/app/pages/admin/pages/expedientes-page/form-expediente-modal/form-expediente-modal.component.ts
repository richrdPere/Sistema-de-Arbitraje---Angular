import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'form-expediente-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './form-expediente-modal.component.html',
})
export class FormExpedienteModalComponent {
  @Output() close = new EventEmitter<void>();
  expedienteForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.expedienteForm = this.fb.group({
      numero: ['', Validators.required],
      anio: ['', Validators.required],
      codigo: ['', Validators.required],
      estado: ['', Validators.required],
      tipo: ['', Validators.required],
      etapa: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechasLaudos: this.fb.array([])
    });
  }

  onSubmit() {
    if (this.expedienteForm.valid) {
      console.log(this.expedienteForm.value);
      this.close.emit();
    }
  }

  cerrarModal() {
    this.close.emit();
  }

}
