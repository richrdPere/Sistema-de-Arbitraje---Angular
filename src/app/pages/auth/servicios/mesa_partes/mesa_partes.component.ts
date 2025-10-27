import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
      this.mensajeError = 'Por favor, completa todos los campos y adjunta un archivo.';
      return;
    }

    const fd = new FormData();
    Object.entries(this.formTramiteMPV.value).forEach(([key, value]) => {
      fd.append(key, value as string);
    });
    if (this.file) fd.append('file', this.file, this.file.name);
    // fd.append('archivo', this.file!);

    // fd.append('tipo_solicitud', this.formTramiteMPV.value.tipo_solicitud);
    // fd.append('descripcion', this.formTramiteMPV.value.descripcion);

    this.enviado = true;



    this.tramiteService.registrarTramite(fd).subscribe({
      next: (response) => {
        this.enviado = false;
        this.mensajeExito = ` ${response.message}`;
        console.log('Trámite registrado:', response.tramite);
        this.formTramiteMPV.reset();
        this.file = null;
      },
      error: (err) => {
        this.enviado = false;
        this.mensajeError = ' Error al registrar la solicitud.';
        console.error(err);
      }
      // next: (res) => { this.enviado = true; this.respuesta = res; },
      // error: (err) => alert(err?.error?.message || 'Error')
    });
  }

}
