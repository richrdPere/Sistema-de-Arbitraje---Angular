import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';

import { DatePipe } from '@angular/common';
import { FormExpedienteModalComponent } from "./form-expediente-modal/form-expediente-modal.component";
import { FormUtils } from 'src/app/utils/form-utils';
import { CommonModule } from '@angular/common';

// Izitoast
import iziToast from 'izitoast';

// Service
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { Expediente } from 'src/app/interfaces/components/expediente';
import { GestionarParticipes } from "./gestionar-participes/gestionar-participes.component";

@Component({
  selector: 'app-expedientes-page',
  imports: [DatePipe, FormExpedienteModalComponent, ReactiveFormsModule, CommonModule, RouterOutlet, GestionarParticipes],
  templateUrl: './expedientes-page.component.html',
  styleUrls: ['./expedientes-page.component.css']
})
export class ExpedientesPageComponent implements OnInit {

  // Expedientes
  expedientes: any = [];

  // =========================
  // VARIABLES
  // =========================
  formExpediente!: FormGroup;
  fb = inject(FormBuilder);
  formUtils = FormUtils;

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

  toggleDropdown(index: number, event: MouseEvent) {
    // Si se vuelve a hacer click en el mismo menú, se cierra
    event.stopPropagation(); // Evita que se cierre inmediatamente
    this.menuAbierto = this.menuAbierto === index ? null : index;
  }

  cerrarDropdown() {
    this.menuAbierto = null;
  }

  // Constructor
  constructor(private expedienteService: ExpedientesService, private router: Router, private eRef: ElementRef) { }

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
  // editarExpediente(exp: any) { console.log('Editar expediente:', exp.numeroExpediente); }
  // eliminarExpediente(exp: any) { console.log('Eliminar expediente:', exp.numeroExpediente); }

  // =========================================================
  // 1.- LOAD EXPDIENTES
  // =========================================================
  cargarExpedientes() {
    this.loading = true;

    this.expedienteService.listarExpedientes().subscribe({
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

  // =========================================================
  // 2.- CREAR EXPEDIENTE / EDITAR EXPEDIENTE
  // =========================================================
  onSubmitExpediente() {
    if (this.formExpediente.invalid) {
      this.formExpediente.markAllAsTouched();
      iziToast.warning({
        title: 'Atención',
        message: 'Por favor, completa todos los campos requeridos',
        position: 'topRight'
      });
      return;
    }

    const formData: any = this.formExpediente.value;

    if (this.modoEdicion && this.selectedExpedienteId) {
      // Actualizar
      this.expedienteService.actualizarExpediente(this.selectedExpedienteId, formData).subscribe({
        next: () => {
          iziToast.success({
            title: 'Éxito',
            message: 'Expediente actualizado correctamente',
            position: 'topRight'
          });
          this.resetForm();
          this.cargarExpedientes();
        },
        error: (err) => {
          console.error(err);
          iziToast.error({
            title: 'Error',
            message: 'No se pudo actualizar el expediente',
            position: 'topRight'
          });
        }
      });
    } else {
      // Crear
      this.expedienteService.crearExpediente(formData).subscribe({
        next: () => {
          iziToast.success({
            title: 'Éxito',
            message: 'Expediente creado correctamente',
            position: 'topRight'
          });
          this.resetForm();
          this.cargarExpedientes();
        },
        error: (err) => {
          console.error(err);
          iziToast.error({
            title: 'Error',
            message: 'No se pudo registrar el expediente',
            position: 'topRight'
          });
        }
      });
    }
  }

  // =========================
  // 3.- EDITAR EXPEDIENTE
  // =========================


  // =========================
  // 4.- ELIMINAR EXPEDIENTE
  // =========================
  eliminarExpediente(id: number): void {
    if (confirm('¿Seguro que deseas eliminar este expediente?')) {
      this.expedienteService.eliminarExpediente(id).subscribe({
        next: () => {
          iziToast.info({
            title: 'Eliminado',
            message: 'Expediente eliminado correctamente',
            position: 'topRight'
          });
          this.cargarExpedientes();
        },
        error: (err) => {
          console.error('Error al eliminar expediente:', err);
          iziToast.error({
            title: 'Error',
            message: 'No se pudo eliminar el expediente',
            position: 'topRight'
          });
        }
      });
    }
  }

  // =========================
  // 5.- BUSCAR EXPEDIENTES
  // =========================
  // buscarExpedientes(estado?: string, tipo?: string): void {
  //   this.loading = true;
  //   this.expedienteService.searchExpedientes(estado, tipo).subscribe({
  //     next: (data) => {
  //       this.expedientes = data;
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       console.error('Error al buscar expedientes:', err);
  //       this.loading = false;
  //     }
  //   });
  // }

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
