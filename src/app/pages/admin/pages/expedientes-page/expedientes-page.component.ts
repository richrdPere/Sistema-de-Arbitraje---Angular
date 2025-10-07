import { Component, inject, OnInit, HostListener, ElementRef  } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpedientesService, Expediente } from '../../../../services/admin/expedientes.service';
import { DatePipe } from '@angular/common';
import { FormExpedienteModalComponent } from "./form-expediente-modal/form-expediente-modal.component";
import { FormUtils } from 'src/app/utils/form-utils';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expedientes-page',
  imports: [DatePipe, FormExpedienteModalComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './expedientes-page.component.html',
  styleUrls: ['./expedientes-page.component.css']
})
export class ExpedientesPageComponent implements OnInit {

  // Datos de prueba
  // expedientes: Expediente[] = []; //  Lista que se enviará a table-expedientes

  expedientes = [
    {
      numeroExpediente: '001-2025/CA-RENA',
      participantes: 3,
      fechaInicio: new Date('2025-01-15T10:00:00'),
      estado: 'En trámite',
      docs: 4,
      actualizacion: new Date('2025-10-02T14:30:00'),
    },
    {
      numeroExpediente: '002-2025/JPRD-RENA',
      participantes: 2,
      fechaInicio: new Date('2025-02-20T09:30:00'),
      estado: 'Archivado',
      docs: 2,
      actualizacion: new Date('2025-06-11T11:00:00'),
    },
    {
      numeroExpediente: '003-2025/MC-RENA',
      participantes: 5,
      fechaInicio: new Date('2025-03-10T08:00:00'),
      estado: 'En trámite',
      docs: 7,
      actualizacion: new Date('2025-09-30T19:15:00'),
    },
    {
      numeroExpediente: '004-2025/CA-RENA',
      participantes: 1,
      fechaInicio: new Date('2024-12-25T11:45:00'),
      estado: 'Finalizado',
      docs: 9,
      actualizacion: new Date('2025-07-01T15:20:00'),
    },
    {
      numeroExpediente: '005-2025/RECUSACIÓN-RENA',
      participantes: 4,
      fechaInicio: new Date('2025-04-12T10:00:00'),
      estado: 'En trámite',
      docs: 1,
      actualizacion: new Date('2025-10-04T08:30:00'),
    },
    {
      numeroExpediente: '006-2025/MC-RENA',
      participantes: 2,
      fechaInicio: new Date('2025-05-05T13:15:00'),
      estado: 'Suspendido',
      docs: 3,
      actualizacion: new Date('2025-09-15T17:40:00'),
    },
    {
      numeroExpediente: '007-2025/JPRD-RENA',
      participantes: 6,
      fechaInicio: new Date('2025-06-18T09:00:00'),
      estado: 'En trámite',
      docs: 5,
      actualizacion: new Date('2025-10-01T21:00:00'),
    },
    {
      numeroExpediente: '008-2025/CA-RENA',
      participantes: 2,
      fechaInicio: new Date('2025-07-02T14:00:00'),
      estado: 'Finalizado',
      docs: 8,
      actualizacion: new Date('2025-09-28T09:00:00'),
    },
    {
      numeroExpediente: '009-2025/MC-RENA',
      participantes: 3,
      fechaInicio: new Date('2025-08-10T12:30:00'),
      estado: 'En trámite',
      docs: 0,
      actualizacion: new Date('2025-10-05T10:45:00'),
    },
    {
      numeroExpediente: '010-2025/JPRD-RENA',
      participantes: 1,
      fechaInicio: new Date('2025-09-25T09:00:00'),
      estado: 'En revisión',
      docs: 6,
      actualizacion: new Date('2025-10-06T19:25:00').toISOString(),
    },
  ];

  // Variables
  fb = inject(FormBuilder);
  formUtils = FormUtils;


  loading = true;
  mostrarModal = false;
  // eRef: any;

  // Constructor
  constructor(private expedienteService: ExpedientesService, private eRef: ElementRef) {

  }

  // onInit
  ngOnInit(): void {
    // Simula carga desde servidor
    setTimeout(() => {
      this.loading = false;
    }, 1500);
    this.loadExpedientes();
  }

  // FormUsers
  // formExpediente = this.fb.group({
  //   firstName: ['', [Validators.required, Validators.pattern(FormUtils.namePattern)]],
  //   lastName: ['', [Validators.required, Validators.pattern(FormUtils.lastNamePattern)]],
  //   dni: ['', Validators.compose([
  //     Validators.required,
  //     Validators.minLength(0),
  //     Validators.maxLength(8),
  //     Validators.pattern(FormUtils.dniPattern),
  //   ])],
  //   phone: ['', Validators.compose([
  //     Validators.required,
  //     Validators.pattern(FormUtils.phonePattern)
  //   ])],
  //   birthdate: ['', [Validators.required, FormUtils.isAdult(18)]],
  //   email: ['', [Validators.required, Validators.email, Validators.pattern(FormUtils.emailPattern)], [FormUtils.checkingServerResponse]],
  //   username: ['', [Validators.required, Validators.minLength(6), Validators.pattern(FormUtils.notOnlySpacesPattern), FormUtils.notStrider]],
  //   role: ['', Validators.required],
  //   password: ['', [Validators.required, Validators.minLength(6)]],
  // }
  // );

  formExpediente = this.fb.group({
    numero: ['', Validators.required],
    anio: ['', Validators.required],
    codigo: ['', Validators.required],
    estado: ['', Validators.required],
    tipo: ['', Validators.required],
    etapa: ['', Validators.required],
    fechaInicio: ['', Validators.required],
    fechasLaudos: this.fb.array([])
  });


  toggleDropdown(menu: HTMLElement, event: MouseEvent) {
    event.stopPropagation();
    const isOpen = menu.classList.contains('dropdown-open');
    document
      .querySelectorAll('.dropdown')
      .forEach(el => el.classList.remove('dropdown-open'));
    if (!isOpen) menu.classList.add('dropdown-open');
  }

  accionYcerrar(menu: HTMLElement, accion: string, exp: any) {
    menu.classList.remove('dropdown-open');

    switch (accion) {
      case 'verDocumentos':
        this.verDocumentos(exp);
        break;
      case 'gestionarParticipes':
        this.gestionarParticipes(exp);
        break;
      case 'verHistorial':
        this.verHistorial(exp);
        break;
      case 'editarExpediente':
        this.editarExpediente(exp);
        break;
      case 'eliminarExpediente':
        this.eliminarExpediente(exp);
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  cerrarDropdowns(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      document
        .querySelectorAll('.dropdown')
        .forEach(el => el.classList.remove('dropdown-open'));
    }
  }

  // Ejemplo de funciones base:
  verDocumentos(exp: any) { console.log('Ver documentos:', exp.numeroExpediente); }
  gestionarParticipes(exp: any) { console.log('Gestionar partícipes:', exp.numeroExpediente); }
  verHistorial(exp: any) { console.log('Ver historial:', exp.numeroExpediente); }
  editarExpediente(exp: any) { console.log('Editar expediente:', exp.numeroExpediente); }
  eliminarExpediente(exp: any) { console.log('Eliminar expediente:', exp.numeroExpediente); }

  // =========================================================
  // 1.- LOAD EXPDIENTES
  // =========================================================
  loadExpedientes() {
    // this.expedienteService.getExpedientes().subscribe({
    //   next: (data) => {
    //     this.expedientes = data;
    //     this.loading = false;
    //   },
    //   error: (err) => {
    //     console.error('Error al cargar expedientes', err);
    //     this.loading = false;
    //   }
    // });
  }

  // =========================================================
  // 2.- CREAR EXPEDIENTE
  // =========================================================
  onSubmitExpediente() {
    this.formExpediente.markAllAsTouched();

    console.log(this.formExpediente.value);

    // // Form invalid
    // if (this.formExpediente.invalid) {
    //   iziToast.error({
    //     title: 'Error',
    //     message: 'Por favor corrige los campos inválidos',
    //     position: 'topRight'
    //   });
    //   return;
    // }

    // const formData = this.formExpediente.value;

    // this.expedienteService.createSereno(formData).subscribe({
    //   next: (res) => {
    //     iziToast.success({
    //       title: 'Éxito',
    //       message: 'Sereno registrado correctamente',
    //       position: 'topRight'
    //     });
    //     this.formExpediente.reset();
    //   },
    //   error: (err) => {
    //     console.error('Error en el registro', err);
    //     const msg = err?.error?.error || 'Error en el servidor';
    //     iziToast.error({
    //       title: 'Error',
    //       message: msg,
    //       position: 'topRight'
    //     });
    //   }
    // });
  }


}
