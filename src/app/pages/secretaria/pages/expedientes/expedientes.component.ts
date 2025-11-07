import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { FormUtils } from 'src/app/utils/form-utils';

// Izitoast
import iziToast from 'izitoast';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
import { AuthService } from 'src/app/services/auth.service';
import { Expediente } from 'src/app/interfaces/components/expediente';



@Component({
  selector: 'app-expedientes',
  imports: [],
  templateUrl: './expedientes.component.html',
})
export class ExpedientesComponent {

  // Variables
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  tramites: any[] = [];


  // =========================
  // VARIABLES
  // =========================
  formExpediente!: FormGroup;

  loading = true;
  mensajeError = '';
  mensajeExito = '';
  filtro: string = '';
  modoEdicion = false;
  mostrarModal = false;
  mostrarModalParticipes = false;
  selectedExpedienteId?: number;
  expedienteSeleccionado: any | null = null;

  menuAbierto: number | null = null;

  rol: string = '';

  toggleDropdown(index: number, event: MouseEvent) {
    // Si se vuelve a hacer click en el mismo menú, se cierra
    event.stopPropagation(); // Evita que se cierre inmediatamente
    this.menuAbierto = this.menuAbierto === index ? null : index;
  }


  cerrarDropdown() {
    this.menuAbierto = null;
  }

  // Constructor
  constructor(private tramiteService: TramiteMPVService, private _authService: AuthService, private router: Router, private eRef: ElementRef) {

    const usuario = _authService.getUser()

    if (usuario) {
      this.rol = usuario.rol;
    }
  }

  // onInit
  ngOnInit(): void {

    this.formExpediente = this.fb.group({
      numero_expediente: ['', Validators.required],
      anio: ['', Validators.required],
      codigo: ['', Validators.required],
      titulo: ['', Validators.required],
      descripcion: [''],
      tipo: ['', Validators.required],
      estado: ['', Validators.required],
      estado_procesal: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_laudo: [''],
      fecha_resolucion: [''],
      fecha_cierre: ['']
    });


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

  // Ejemplo de funciones base:
  verDocumentos(exp: any) { this.router.navigate([`admin/expedientes/${exp.id_expediente}/documentos`]); }
  gestionarParticipes(exp: any) { console.log('Gestionar partícipes:', exp.numeroExpediente); }
  verHistorial(exp: any) { this.router.navigate([`admin/expedientes/${exp.id_expediente}/historial`]); }
  editarExpediente(exp: Expediente): void {
    this.modoEdicion = true;
    this.expedienteSeleccionado = exp;
    this.mostrarModal = true;
  }

  // =========================================================
  // 1.- LOAD EXPDIENTES
  // =========================================================
  cargarExpedientes(pagina: number = 1) {
    this.loading = true;

    this.tramiteService.listarTramites(pagina, 20, this.rol).subscribe({
      next: (data) => {
        let tramites = data.tramites || [];

        //  Filtrar según el rol actual
        if (this.rol === 'secretaria') {
          tramites = tramites.filter(t => t.estado === 'aprobada');
        }
        // else if (this.rol === 'admin') {
        //   tramites = tramites.filter(t => t.estado === 'pendiente');
        // }

        //  Clasificar por estado (para tus tabs)
        //this.solicitudes = tramites.filter(t => t.estado === 'pendiente');
        this.tramites = tramites.filter(t => t.estado === 'aprobada');
        // this.solicitudesRechazadas = tramites.filter(t => t.estado === 'rechazada');

        console.log('Pendientes:', this.tramites);

        // this.paginaActual = data.pagina_actual;
        // this.totalPaginas = data.total_paginas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al listar trámites:', err);
        this.loading = false;
      },
    });
  }

}
