import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

// Service
import { Contacto, ContactoService } from 'src/app/services/contacto.service';

// IziToast
import iziToast from 'izitoast';

@Component({
  selector: 'app-contactos',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './contactos.component.html',
})
export class ContactosComponent {

  contacto: Contacto = {
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
    archivos: [],
  };

  enviando = false;
  mensaje = '';

  constructor(private contactoService: ContactoService) { }

  onFileChange(event: any) {
    this.contacto.archivos = Array.from(event.target.files);
  }

  enviarFormulario() {
    this.enviando = true;
    this.mensaje = '';

    this.contactoService
      .enviarContacto(this.contacto)
      .pipe(finalize(() => (this.enviando = false)))
      .subscribe({
        next: (res) => {
          this.mensaje = 'Mensaje enviado correctamente';

          iziToast.success({
            title: 'Éxito',
            message: 'Tu mensaje fue enviado correctamente 🎉',
            position: 'topRight',
            timeout: 4000,
            transitionIn: 'bounceInLeft',
            transitionOut: 'fadeOutRight',
          });

          // Limpia el formulario después del envío
          this.contacto = {
            nombre: '',
            email: '',
            telefono: '',
            asunto: '',
            mensaje: '',
          };
          // this.enviando = false
        },
        error: (err) => {
          this.mensaje = 'Error al enviar el mensaje';

          iziToast.error({
            title: 'Error',
            message: 'No se pudo enviar el mensaje. Intenta nuevamente 😞',
            position: 'topRight',
            timeout: 4000,
            transitionIn: 'bounceInLeft',
            transitionOut: 'fadeOutRight',
          });
        },
      });
  }

}
