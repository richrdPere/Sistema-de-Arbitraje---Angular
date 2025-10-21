import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trazabilidad',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './trazabilidad.component.html',
})
export class TrazabilidadComponent implements OnInit {

  formTrazabilidad: FormGroup;
  resultado: any = null;

  constructor(private fb: FormBuilder) {
    this.formTrazabilidad = this.fb.group({
      tipo: ['administracion'],   // ejemplo: radio/selector
      email: ['', [Validators.required, Validators.min(1)]],
      nro: [null],       //  ahora sí existe
      anio: [null],       //  ahora sí existe
      codigo: [null],       //  ahora sí existe
      contraseña: [null],        //  ahora sí existe

    });
  }


  ngOnInit(): void {

  }

  // ==================================
  // Propiedad para guardar el tipo seleccionado
  // ==================================
  tipoUsuario: 'administracion' | 'usuarios' = 'administracion';

  seleccionarUsuario(tipo: 'administracion' | 'usuarios') {
    this.tipoUsuario = tipo;
    // aquí podrías resetear/calcular lo que necesites según tipo
    console.log('Tipo Usuario seleccionada:', this.tipoUsuario);

    // Reiniciamos los valores del formulario sin destruir su estructura
    this.formTrazabilidad.reset({
      tipo: tipo,
      email: '',
      nro: null,
      anio: null,
      codigo: null,
      contraseña: null
    });

    // Si quieres mantener el enfoque en el campo "monto"
    setTimeout(() => {
      const montoInput = document.querySelector<HTMLInputElement>('input[formControlName="email"]');
      montoInput?.focus();
    }, 100);

    setTimeout(() => {
      const montoInput = document.querySelector<HTMLInputElement>('input[formControlName="nro"]');
      montoInput?.focus();
    }, 100);
  }

}
