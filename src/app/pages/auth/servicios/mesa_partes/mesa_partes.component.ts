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

  constructor(private fb: FormBuilder, private tramiteService: TramiteMPVService) {
    this.formTramiteMPV = this.fb.group({
      tipo_solicitud: ['', Validators.required],
      descripcion: ['', Validators.required],
      // id_expediente: ['']
    });
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length) this.file = input.files[0];
  }

  enviar() {
    if (this.formTramiteMPV.invalid) return this.formTramiteMPV.markAllAsTouched();
    const fd = new FormData();
    fd.append('tipo_solicitud', this.formTramiteMPV.value.tipo_solicitud);
    fd.append('descripcion', this.formTramiteMPV.value.descripcion);
    // if (this.formTramiteMPV.value.id_expediente) fd.append('id_expediente', this.formTramiteMPV.value.id_expediente);
    if (this.file) fd.append('file', this.file, this.file.name);

    this.tramiteService.registrarTramite(fd).subscribe({
      next: (res) => { this.enviado = true; this.respuesta = res; },
      error: (err) => alert(err?.error?.message || 'Error')
    });
  }

}
