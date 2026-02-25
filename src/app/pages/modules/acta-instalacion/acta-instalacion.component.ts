import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';

// Services
import { ActaInstalacion, Expediente } from 'src/app/interfaces/acta-instalacion.model';
import { ActaInstalacionService } from 'src/app/services/acta-instalacion.service';
import { UsuarioService } from 'src/app/services/admin/usuarios.service';
import { AuthService } from 'src/app/services/auth.service';
import { InstalacionFormComponent } from "./instalacion-form/instalacion-form.component";
import { FormUtils } from 'src/app/utils/form-utils';
import { Router } from '@angular/router';


@Component({
  selector: 'app-acta-instalacion',
  imports: [CommonModule, FormsModule, InstalacionFormComponent],
  templateUrl: './acta-instalacion.component.html',
  styles: ``
})
export class ActaInstalacionComponent implements OnInit {


  // Actas
  actas_instalacion: any[] = [];

  // Formulario
  fb = inject(FormBuilder);
  formUtils = FormUtils;
  formActaInstalacion!: FormGroup;
  rol: string = '';

  // Filtros
  loading = true;
  mensajeError = '';
  mensajeExito = '';
  filtro: string = '';
  mostrarModal = false;
  modoEdicion = false;
  selectedActaId?: number;
  actaSeleccionado: any | null = null;




  // Modal
  modalOpen = false;
  actaSeleccionada: any = null;

  constructor(
    private actaInstalacionService: ActaInstalacionService,
    private _authService: AuthService,
    private router: Router,
  ) {
    const usuario = _authService.getUser();
    if (usuario) {
      this.rol = usuario.rol;
    }
  }

  ngOnInit(): void {
    // this.initFormActa();
    this.getActasInstalacion();
  }





  abrirModal() {
    this.modoEdicion = false;
    this.actaSeleccionado = null;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.formActaInstalacion.reset();
  }

  eliminarActa(arg0: any) {
    throw new Error('Method not implemented.');
  }

    // =========================================================
  // 1.- LOAD ACTAS
  // =========================================================
  getActasInstalacion() {
    this.loading = false;
    this.actas_instalacion = [
      {
        id: 1,
        expediente: 'EXP-2024-001',
        secretaria: 'María López',
        arbitro: 'Dr. Juan Pérez',
        estado: 'convocada',
        fecha_convocatoria: '2024-01-10',
        fecha_instalacion: '2024-01-15',
      },
      {
        id: 2,
        expediente: 'EXP-2024-002',
        secretaria: 'Ana Torres',
        arbitro: 'Dr. Carlos Ramírez',
        estado: 'en_proceso',
        fecha_convocatoria: '2024-02-05',
        fecha_instalacion: '2024-02-10',
      },
      {
        id: 3,
        expediente: 'EXP-2024-003',
        secretaria: 'Lucía Fernández',
        arbitro: 'Dr. Miguel Salazar',
        estado: 'instalada',
        fecha_convocatoria: '2024-03-01',
        fecha_instalacion: '2024-03-06',
      },
      {
        id: 4,
        expediente: 'EXP-2024-004',
        secretaria: 'Patricia Rojas',
        arbitro: 'Dr. Roberto Chávez',
        estado: 'firmada',
        fecha_convocatoria: '2024-03-15',
        fecha_instalacion: '2024-03-20',
      },
      {
        id: 5,
        expediente: 'EXP-2024-005',
        secretaria: 'Carmen Medina',
        arbitro: 'Dr. Luis Gutiérrez',
        estado: 'cancelada',
        fecha_convocatoria: '2024-04-01',
        fecha_instalacion: '2024-04-05',
      },
      {
        id: 6,
        expediente: 'EXP-2024-006',
        secretaria: 'Rosa Huamán',
        arbitro: 'Dr. Álvaro Mendoza',
        estado: 'convocada',
        fecha_convocatoria: '2024-04-18',
        fecha_instalacion: '2024-04-22',
      },
    ];

  }

  guardarActa(data: any) {
    if (data.id) {
      // EDITAR
    } else {
      // CREAR
    }
    this.modalOpen = false;
  }

  editarActa(acta: any) {
    this.actaSeleccionada = acta;
    this.modalOpen = true;
  }
  reportePDF(_t44: any) {
    throw new Error('Method not implemented.');
  }
  openInstalacion() {
    this.abrirModal();
  }



}
