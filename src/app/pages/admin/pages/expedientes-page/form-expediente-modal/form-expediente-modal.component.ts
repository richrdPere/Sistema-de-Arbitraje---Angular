import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

// Utils
import { FormUtils } from 'src/app/utils/form-utils';

@Component({
  selector: 'expediente-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './form-expediente-modal.component.html',
})
export class FormExpedienteModalComponent implements OnInit {


  // Validadores
  formUtils = FormUtils;

  // Input del componente padre
  @Input() formExpediente!: FormGroup;

  // Output hacia el componente padre
  @Output() submitForm = new EventEmitter<void>();

  ngOnInit() {

  }



  onSave() {
    this.submitForm.emit();
  }

  // onSubmit() {
  //   if (this.expedienteForm.valid) {
  //     console.log(this.expedienteForm.value);
  //     this.close.emit();
  //   }
  // }

  // cerrarModal() {
  //   this.close.emit();
  // }

}
