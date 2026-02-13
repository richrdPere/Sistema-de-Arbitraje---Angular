import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { GestionarParticipesComponent } from "./gestionar-participes/gestionar-participes.component";

@Component({
  selector: 'app-expedientes',
  imports: [DatePipe, ReactiveFormsModule, FormsModule, CommonModule, RouterOutlet, ExpedienteModalComponent, GestionarParticipesComponent],
  templateUrl: './expedientes.component.html',
  styles: ``
})
export class ExpedientesComponent {


  // Expedientes
  expedientes: any = [];
  searchTimeout: any;

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

  menuActivo: any = null;
  dropdownStyle: any = {};

  // Control de error (opcional)
  errorMessage: string = '';

  // Search y filtros
  search: string = '';
  rolFiltro: string = '';

  meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  anios: number[] = [];

  filtroMes: number | '' = '';
  filtroAnio: number | '' = '';
  filtroSearch = '';

  // Paginado
  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  pageSizeOptions = [5, 10, 20, 50];

  onPageSizeChange() {
    this.currentPage = 1; // vuelve a la primera página
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.cargarExpedientes();
  }

  cambiarLimite() {
    // this.limit = Number(this.limit);
    this.page = 1;
    this.cargarExpedientes();
  }

  toggleDropdown(event: MouseEvent, expediente: any) {
    event.stopPropagation();

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    this.menuActivo = expediente;

    this.dropdownStyle = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.right - 200}px`, // ancho del menú
    };
  }

  // Cerrar al hacer click fuera
  @HostListener('document:click')
  cerrarDropdown() {
    this.menuActivo = null;
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

    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= anioActual - 5; i--) {
      this.anios.push(i);
    }

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

  aplicarFiltros() {
    this.page = 1; // reinicia paginación

    this.cargarExpedientes(
    );
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
  verDocumentos(exp: any)
  { this.router.navigate([`app/expedientes/${exp.id_expediente}/documentos`]); }

  gestionarParticipesModal(exp: any) {
    // this.router.navigate([`app/expedientes/${exp.id_expediente}/participes`]);

    console.log("GES. PARTICIPES: ", exp);
    this.expedienteSeleccionado = exp;
    this.mostrarModalParticipes = true;

  }

  cerrarModalParticipes() {
    this.mostrarModalParticipes = false;
    this.expedienteSeleccionado = null;
  }


  verHistorial(exp: any) { this.router.navigate([`app/expedientes/${exp.id_expediente}/historial`]); }

  editarExpediente(exp: Expediente): void {

    console.log("EDITANDO EXP: ", exp)

    this.modoEdicion = true;
    this.expedienteSeleccionado = exp;
    this.mostrarModal = true;
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.cargarExpedientes();
    }, 200);
  }


  // =========================================================
  // 1.- LOAD EXPDIENTES
  // =========================================================
  cargarExpedientes() {
    this.loading = true;

    console.log("MES: ", this.filtroMes);
    console.log("ANIO: ", this.filtroAnio);

    this.expedienteService.listarExpedientes({
      page: this.page,
      limit: this.limit,
      search: this.filtroSearch?.trim() || undefined,
      mes: this.filtroMes || undefined,
      anio: this.filtroAnio || undefined,
      rol: this.rol || 'secretaria',
    }).subscribe({
      next: (resp) => {
        this.expedientes = resp.data;
        this.totalItems = resp.total;
        this.totalPages = resp.totalPages;
        this.currentPage = resp.page;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar expedientes:', err);
        this.loading = false;
        this.errorMessage = 'Error al cargar los expedientes';
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





  anularExpediente(arg0: any) {
    throw new Error('Method not implemented.');
  }

}
