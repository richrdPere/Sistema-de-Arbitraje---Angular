import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';

@Component({
  selector: 'app-mesa-partes',
  imports: [ReactiveFormsModule],
  templateUrl: './mesa_partes.component.html',
})
export class MesaPartesComponent {

  formTramiteMPV: FormGroup;
  file: File | null = null;
  enviado = false;
  respuesta: any;
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(private fb: FormBuilder, private tramiteService: TramiteMPVService) {
    this.formTramiteMPV = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      telefono: ['', Validators.required],
      documento_identidad: ['', Validators.required],
      tipo_solicitud: ['', Validators.required],
      descripcion: ['', Validators.required],
      codigo: ['', Validators.required] // viene desde el sistema
    });
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length) this.file = input.files[0];
  }

  enviar() {
    if (this.formTramiteMPV.invalid) return this.formTramiteMPV.markAllAsTouched();

    if (this.formTramiteMPV.invalid || !this.file) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos y adjunta un archivo antes de enviar.',
        confirmButtonColor: '#3085d6'
      });
      return this.formTramiteMPV.markAllAsTouched();
    }

    const fd = new FormData();
    Object.entries(this.formTramiteMPV.value).forEach(([key, value]) => {
      fd.append(key, value as string);
    });
    if (this.file) fd.append('file', this.file, this.file.name);
    this.enviado = true;

    // Mostramos un loader mientras se envía
    Swal.fire({
      title: 'Enviando solicitud...',
      text: 'Por favor espera mientras procesamos tu trámite.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.tramiteService.registrarTramite(fd).subscribe({
      next: (response) => {
        this.respuesta = response; //  guarda respuesta
        this.enviado = true;

        Swal.fire({
          icon: 'success',
          title: '¡Solicitud enviada!',
          text: response.message || 'Tu trámite fue registrado correctamente.',
          confirmButtonColor: '#16a34a'
        });

        // this.mensajeExito = ` ${response.message}`;
        console.log('Trámite registrado:', response.tramite);
        this.formTramiteMPV.reset();
        this.file = null;
      },
      error: (err) => {
        this.enviado = false;
        this.mensajeError = ' Error al registrar la solicitud.';
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar la solicitud',
          text: err?.error?.message || 'Ocurrió un error al procesar tu trámite.',
          confirmButtonColor: '#d33'
        });
        console.error(err);
      }
    });
  }

}
