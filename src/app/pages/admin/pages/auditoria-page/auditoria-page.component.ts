import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';

@Component({
  selector: 'app-auditoria-page',
  imports: [ReactiveFormsModule],
  templateUrl: './auditoria-page.component.html',
})
export class AuditoriaPageComponent implements OnInit {

  // Variables
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  loading = true;
  mostrarModal = false;

  auditorias = [
    {
      expediente: '1-2025/JPRD-RENA',
      hora: '20:34',
      accion: 'Inicio de sesión',
      usuario: 'Carlos Pérez',
      fecha: '2025-10-01 08:35',
      descripcion: 'El usuario inició sesión correctamente en el sistema.',
      ip: '192.168.1.10',
    },
    {
      expediente: '002-2025/CA-RENA',
      hora: '16:57',
      accion: 'Creación de expediente',
      usuario: 'María López',
      fecha: '2025-10-01 09:10',
      descripcion: 'Se creó el expediente N° EXP-2025-010.',
      ip: '192.168.1.12',
    },
    {
      expediente: '001-2025/CA-RENA',
      hora: '14:40',
      accion: 'Modificación de datos',
      usuario: 'Luis Ramos',
      fecha: '2025-10-02 11:45',
      descripcion: 'Actualizó los datos del participante ID 23.',
      ip: '192.168.1.14',
    },
    {
      expediente: '001-2025/CA-RENA',
      hora: '10:43',
      accion: 'Eliminación de usuario',
      usuario: 'Administrador',
      fecha: '2025-10-02 14:20',
      descripcion: 'Eliminó al usuario con correo: jose@correo.com.',
      ip: '192.168.1.15',
    },
    {
      expediente: '001-2025/CA-RENA',
      hora: '10:41',
      accion: 'Cierre de sesión',
      usuario: 'Carlos Pérez',
      fecha: '2025-10-02 18:00',
      descripcion: 'El usuario cerró sesión del sistema.',
      ip: '192.168.1.10',
    },
  ];


  ngOnInit(): void {
    // Aquí puedes inicializar datos o lógica al cargar el componente
    this.loading = false;
  }


}
