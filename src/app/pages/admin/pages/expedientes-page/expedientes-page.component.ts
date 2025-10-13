import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpedientesService, Expediente } from '../../../../services/admin/expedientes.service';
import { DatePipe } from '@angular/common';
import { FormExpedienteModalComponent } from "./form-expediente-modal/form-expediente-modal.component";
import { FormUtils } from 'src/app/utils/form-utils';
import { CommonModule } from '@angular/common';

import iziToast from 'izitoast';

@Component({
  selector: 'app-expedientes-page',
  imports: [DatePipe, FormExpedienteModalComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './expedientes-page.component.html',
  styleUrls: ['./expedientes-page.component.css']
})
export class ExpedientesPageComponent implements OnInit {


  // =========================
  // VARIABLES
  // =========================
  expedientes: Expediente[] = [];
  loading = true;
  editMode = false;
  selectedExpedienteId?: number;

  fb = inject(FormBuilder);
  formUtils = FormUtils;

  // Modal
  mostrarModal = false;
  // eRef: any;

  // =========================
  // FORMULARIO
  // =========================
  formExpediente: FormGroup = this.fb.group({
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

  // Constructor

  constructor(private expedienteService: ExpedientesService, private eRef: ElementRef) { }

  // onInit
  ngOnInit(): void {
    // Simula carga desde servidor
    // setTimeout(() => {
    //   this.loading = false;
    // }, 1500);
    this.loadExpedientes();
  }

  // Ejemplo de funciones base:
  verDocumentos(exp: any) { console.log('Ver documentos:', exp.numeroExpediente); }
  gestionarParticipes(exp: any) { console.log('Gestionar partícipes:', exp.numeroExpediente); }
  verHistorial(exp: any) { console.log('Ver historial:', exp.numeroExpediente); }
  // editarExpediente(exp: any) { console.log('Editar expediente:', exp.numeroExpediente); }
  // eliminarExpediente(exp: any) { console.log('Eliminar expediente:', exp.numeroExpediente); }

  // =========================================================
  // 1.- LOAD EXPDIENTES
  // =========================================================
  loadExpedientes() {
    this.expedienteService.getExpedientes().subscribe({
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

    const formData: Expediente = this.formExpediente.value;

    if (this.editMode && this.selectedExpedienteId) {
      // Actualizar
      this.expedienteService.updateExpediente(this.selectedExpedienteId, formData).subscribe({
        next: () => {
          iziToast.success({
            title: 'Éxito',
            message: 'Expediente actualizado correctamente',
            position: 'topRight'
          });
          this.resetForm();
          this.loadExpedientes();
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
      this.expedienteService.createExpediente(formData).subscribe({
        next: () => {
          iziToast.success({
            title: 'Éxito',
            message: 'Expediente creado correctamente',
            position: 'topRight'
          });
          this.resetForm();
          this.loadExpedientes();
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
  editarExpediente(exp: Expediente): void {
    this.editMode = true;
    this.selectedExpedienteId = exp.id_expediente;
    this.mostrarModal = true;

    this.formExpediente.patchValue({
      numero_expediente: exp.numero_expediente,
      codigo: exp.codigo,
      titulo: exp.titulo,
      descripcion: exp.descripcion,
      tipo: exp.tipo,
      estado: exp.estado,
      estado_procesal: exp.estado_procesal,
      fecha_inicio: exp.fecha_inicio,
      fecha_laudo: exp.fecha_laudo,
      fecha_resolucion: exp.fecha_resolucion,
      fecha_cierre: exp.fecha_cierre
    });
  }

  // =========================
  // 4.- ELIMINAR EXPEDIENTE
  // =========================
  eliminarExpediente(id: number): void {
    if (confirm('¿Seguro que deseas eliminar este expediente?')) {
      this.expedienteService.deleteExpediente(id).subscribe({
        next: () => {
          iziToast.info({
            title: 'Eliminado',
            message: 'Expediente eliminado correctamente',
            position: 'topRight'
          });
          this.loadExpedientes();
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
  buscarExpedientes(estado?: string, tipo?: string): void {
    this.loading = true;
    this.expedienteService.searchExpedientes(estado, tipo).subscribe({
      next: (data) => {
        this.expedientes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al buscar expedientes:', err);
        this.loading = false;
      }
    });
  }

  // =========================
  // 6.- RESET FORMULARIO
  // =========================
  resetForm(): void {
    this.formExpediente.reset();
    this.editMode = false;
    this.mostrarModal = false;
    this.selectedExpedienteId = undefined;
  }

  // =========================
  // 7.- DROPDOWN
  // =========================
  toggleDropdown(menu: HTMLElement, event: MouseEvent): void {
    event.stopPropagation();
    const isOpen = menu.classList.contains('dropdown-open');
    document.querySelectorAll('.dropdown').forEach(el => el.classList.remove('dropdown-open'));
    if (!isOpen) menu.classList.add('dropdown-open');
  }

  accionYcerrar(menu: HTMLElement, accion: string, exp: Expediente): void {
    menu.classList.remove('dropdown-open');
    switch (accion) {
      case 'editar':
        this.editarExpediente(exp);
        break;
      case 'eliminar':
        if (exp.id_expediente) this.eliminarExpediente(exp.id_expediente);
        break;
      default:
        console.log('Acción no reconocida');
    }
  }

  @HostListener('document:click', ['$event'])
  cerrarDropdowns(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      document.querySelectorAll('.dropdown').forEach(el => el.classList.remove('dropdown-open'));
    }
  }

  // toggleDropdown(menu: HTMLElement, event: MouseEvent) {
  //   event.stopPropagation();
  //   const isOpen = menu.classList.contains('dropdown-open');
  //   document
  //     .querySelectorAll('.dropdown')
  //     .forEach(el => el.classList.remove('dropdown-open'));
  //   if (!isOpen) menu.classList.add('dropdown-open');
  // }

  // accionYcerrar(menu: HTMLElement, accion: string, exp: any) {
  //   menu.classList.remove('dropdown-open');

  //   switch (accion) {
  //     case 'verDocumentos':
  //       this.verDocumentos(exp);
  //       break;
  //     case 'gestionarParticipes':
  //       this.gestionarParticipes(exp);
  //       break;
  //     case 'verHistorial':
  //       this.verHistorial(exp);
  //       break;
  //     case 'editarExpediente':
  //       this.editarExpediente(exp);
  //       break;
  //     case 'eliminarExpediente':
  //       this.eliminarExpediente(exp);
  //       break;
  //   }
  // }

  // @HostListener('document:click', ['$event'])
  // cerrarDropdowns(event: Event) {
  //   if (!this.eRef.nativeElement.contains(event.target)) {
  //     document
  //       .querySelectorAll('.dropdown')
  //       .forEach(el => el.classList.remove('dropdown-open'));
  //   }
  // }


  // Datos de prueba
  // expedientes: Expediente[] = []; //  Lista que se enviará a table-expedientes

  // expedientes = [
  //   {
  //     numeroExpediente: '001-2025/CA-RENA',
  //     participantes: 3,
  //     fechaInicio: new Date('2025-01-15T10:00:00'),
  //     estado: 'En trámite',
  //     docs: 4,
  //     actualizacion: new Date('2025-10-02T14:30:00'),
  //   },
  //   {
  //     numeroExpediente: '002-2025/JPRD-RENA',
  //     participantes: 2,
  //     fechaInicio: new Date('2025-02-20T09:30:00'),
  //     estado: 'Archivado',
  //     docs: 2,
  //     actualizacion: new Date('2025-06-11T11:00:00'),
  //   },
  //   {
  //     numeroExpediente: '003-2025/MC-RENA',
  //     participantes: 5,
  //     fechaInicio: new Date('2025-03-10T08:00:00'),
  //     estado: 'En trámite',
  //     docs: 7,
  //     actualizacion: new Date('2025-09-30T19:15:00'),
  //   },
  //   {
  //     numeroExpediente: '004-2025/CA-RENA',
  //     participantes: 1,
  //     fechaInicio: new Date('2024-12-25T11:45:00'),
  //     estado: 'Finalizado',
  //     docs: 9,
  //     actualizacion: new Date('2025-07-01T15:20:00'),
  //   },
  //   {
  //     numeroExpediente: '005-2025/RECUSACIÓN-RENA',
  //     participantes: 4,
  //     fechaInicio: new Date('2025-04-12T10:00:00'),
  //     estado: 'En trámite',
  //     docs: 1,
  //     actualizacion: new Date('2025-10-04T08:30:00'),
  //   },
  //   {
  //     numeroExpediente: '006-2025/MC-RENA',
  //     participantes: 2,
  //     fechaInicio: new Date('2025-05-05T13:15:00'),
  //     estado: 'Suspendido',
  //     docs: 3,
  //     actualizacion: new Date('2025-09-15T17:40:00'),
  //   },
  //   {
  //     numeroExpediente: '007-2025/JPRD-RENA',
  //     participantes: 6,
  //     fechaInicio: new Date('2025-06-18T09:00:00'),
  //     estado: 'En trámite',
  //     docs: 5,
  //     actualizacion: new Date('2025-10-01T21:00:00'),
  //   },
  //   {
  //     numeroExpediente: '008-2025/CA-RENA',
  //     participantes: 2,
  //     fechaInicio: new Date('2025-07-02T14:00:00'),
  //     estado: 'Finalizado',
  //     docs: 8,
  //     actualizacion: new Date('2025-09-28T09:00:00'),
  //   },
  //   {
  //     numeroExpediente: '009-2025/MC-RENA',
  //     participantes: 3,
  //     fechaInicio: new Date('2025-08-10T12:30:00'),
  //     estado: 'En trámite',
  //     docs: 0,
  //     actualizacion: new Date('2025-10-05T10:45:00'),
  //   },
  //   {
  //     numeroExpediente: '010-2025/JPRD-RENA',
  //     participantes: 1,
  //     fechaInicio: new Date('2025-09-25T09:00:00'),
  //     estado: 'En revisión',
  //     docs: 6,
  //     actualizacion: new Date('2025-10-06T19:25:00').toISOString(),
  //   },
  // ];

  // }

}
