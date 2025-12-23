import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'calendario-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './calendario-form.component.html',
  styles: ``
})
export class CalendarioFormComponent implements OnInit {

  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() actividadSeleccionado: any = null;

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() actividadCreado = new EventEmitter<void>();


  formActividad!: FormGroup;
  loading = false;
  mensajeError = '';
  mensajeExito = '';

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


  constructor(private fb: FormBuilder, private authService: AuthService) {

  }


  ngOnInit(): void {
    this.initFormActividad();
    this.setModalWidth('md');

  }

  initFormActividad(): void {
    this.formActividad = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      fecha_actividad: ['', Validators.required],
      tipo_actividad: ['', Validators.required],
    });
  }


  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();
    this.formActividad.reset();
  }

}
