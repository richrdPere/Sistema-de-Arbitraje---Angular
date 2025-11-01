import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { FormUtils } from 'src/app/utils/form-utils';
import { DatePipe } from '@angular/common';

// Izitoast
import iziToast from 'izitoast';

// Service
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';



@Component({
  selector: 'app-expediente.component',
  imports: [DatePipe, RouterOutlet],
  templateUrl: './expediente.component.html',
})
export class ExpedienteComponent implements OnInit {


  // Expedientes
  expedientes: any = [];

  // =========================
  // VARIABLES
  // =========================
  formExpediente!: FormGroup;
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  loading = false;
  mensajeError = '';
  mensajeExito = '';
  filtro: string = '';
  modoEdicion = false;
  mostrarModal = false;
  mostrarModalParticipes = false;
  selectedExpedienteId?: number;
  expedienteSeleccionado: any | null = null;

  menuAbierto: number | null = null;

  toggleDropdown(index: number, event: MouseEvent) {
    // Si se vuelve a hacer click en el mismo menú, se cierra
    event.stopPropagation(); // Evita que se cierre inmediatamente
    this.menuAbierto = this.menuAbierto === index ? null : index;
  }

  // Constructor
  constructor(private expedienteService: ExpedientesService, private router: Router, private cdr: ChangeDetectorRef) { }


  // onInit
  ngOnInit(): void {

    this.cargarExpedientes();
  }

  abrirModal() {
    this.modoEdicion = false;
    this.expedienteSeleccionado = null;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.formExpediente.reset();
  }

  verDocumentos(exp: any) { this.router.navigate([`admin/expedientes/${exp.id_expediente}/documentos`]); }

  // =========================================================
  // 1.- LOAD EXPEDIENTES
  // =========================================================
  cargarExpedientes() {
    this.loading = true;

    this.expedienteService.listarExpedientes().subscribe({
      next: (data) => {
        console.log('Respuesta API:', data);
        this.expedientes = data;
        this.loading = false;
        this.cdr.detectChanges(); //  fuerza render si algo no se muestra
      },
      error: (err) => {
        console.error('Error al cargar expedientes:', err);
        this.loading = false;
      },
    });
  }

  // =========================================================
  // 2.- SUBIR INFORME
  // =========================================================


}
