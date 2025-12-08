import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';

import { DatePipe } from '@angular/common';

import { FormUtils } from 'src/app/utils/form-utils';
import { CommonModule } from '@angular/common';
import { ExpedienteModalComponent } from "./expediente-modal/expediente-modal.component";


// Interface
import { Expediente } from 'src/app/interfaces/components/expediente';

// Izitoast
import iziToast from 'izitoast';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';

@Component({
  selector: 'app-expedientes',
  imports: [DatePipe, ReactiveFormsModule, CommonModule, RouterOutlet, ExpedienteModalComponent],
  templateUrl: './expedientes.component.html',
  styles: ``
})
export class ExpedientesComponent {

  // Expedientes
  expedientes: any = [];


  // =========================
  // VARIABLES
  // =========================
  fb = inject(FormBuilder);
  formUtils = FormUtils;

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

  // Control de error (opcional)
  errorMessage: string = '';

  toggleDropdown(index: number, event: MouseEvent) {
    // Si se vuelve a hacer click en el mismo menú, se cierra
    event.stopPropagation(); // Evita que se cierre inmediatamente
    this.menuAbierto = this.menuAbierto === index ? null : index;
  }


  cerrarDropdown() {
    this.menuAbierto = null;
  }

  // Constructor
  constructor(
    private tramiteService: TramiteMPVService,
    private expedienteService: ExpedientesService,
    private _authService: AuthService,
    private router: Router,
    private eRef: ElementRef) {

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
  verDocumentos(exp: any) { this.router.navigate([`app/expedientes/${exp.id_expediente}/documentos`]); }
  gestionarParticipes(exp: any) {
    this.router.navigate([`app/expedientes/${exp.id_expediente}/participes`]);
  }

  verHistorial(exp: any) { this.router.navigate([`app/expedientes/${exp.id_expediente}/historial`]); }
  editarExpediente(exp: Expediente): void {
    this.modoEdicion = true;
    this.expedienteSeleccionado = exp;
    this.mostrarModal = true;
  }

  // =========================================================
  // 1.- LOAD EXPDIENTES
  // =========================================================
  cargarExpedientes() {
    this.loading = true;

    this.expedienteService.listarExpedientes('secretaria').subscribe({
      next: (data) => {
        this.expedientes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar expedientes:', err);
        this.loading = false;
      },
    });
  }

  // =========================
  // 6.- RESET FORMULARIO
  // =========================
  resetForm(): void {
    this.formExpediente.reset();
    // this.editMode = false;
    this.mostrarModal = false;
    this.selectedExpedienteId = undefined;
  }


  @HostListener('document:click', ['$event'])
  onClickFuera(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.cerrarDropdown();
    }
  }

  cerrarModalParticipes() {
    this.mostrarModalParticipes = false;
    this.expedienteSeleccionado = null;
  }

}
