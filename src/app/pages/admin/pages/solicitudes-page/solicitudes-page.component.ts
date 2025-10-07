import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';

@Component({
  selector: 'app-solicitudes-page',
  imports: [ReactiveFormsModule],
  templateUrl: './solicitudes-page.component.html',
})
export class SolicitudesPageComponent {

  // Variables
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  loading = true;
  mostrarModal = false;

  solicitudes = [
    {
      expediente: '1-2025/JPRD-RENA',
      tipo: 'Creación de expediente',
      usuario: 'Ana Torres',
      fecha: '2025-10-01',
      estado: 'Pendiente',
      correo: '',
      condicion: '',
    },
    {
      expediente: '002-2025/CA-RENA',
      tipo: 'Cambio de rol',
      usuario: 'José Vega',
      fecha: '2025-09-30',
      estado: 'Aprobada',
       correo: '',
      condicion: '',
    },
    {
      expediente: '001-2025/CA-RENA',
      tipo: 'Restablecer contraseña',
      usuario: 'Lucía Fernández',
      fecha: '2025-09-29',
      estado: 'Rechazada',
       correo: '',
      condicion: '',
    },
    {
      expediente: '001-2025/CA-RENA',
      tipo: 'Actualización de datos',
      usuario: 'Pedro Morales',
      fecha: '2025-10-02',
      estado: 'Pendiente',
       correo: '',
      condicion: '',
    },
    {
      expediente: '001-2025/CA-RENA',
      tipo: 'Solicitud de acceso',
      usuario: 'Carmen Silva',
      fecha: '2025-10-03',
      estado: 'Aprobada',
       correo: '',
      condicion: '',
    },
  ];
}
