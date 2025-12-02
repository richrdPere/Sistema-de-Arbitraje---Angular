import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

// Service
import { PerfilService } from 'src/app/services/perfil.service';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
  fb = inject(FormBuilder);
  perfilForm!: FormGroup;
  passwordForm!: FormGroup;
  loading = true;
  fotoPreview: string | ArrayBuffer | null = null;

  constructor(private perfilService: PerfilService) { }

  ngOnInit(): void {
    this.initForms();

    this.cargarPerfil();
  }


  private initForms() {
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      telefono: [''],
      documento_identidad: [''],
      rol: [{ value: '', disabled: true }],
    });

    this.passwordForm = this.fb.group({
      passwordActual: ['', Validators.required],
      nuevaPassword: ['', Validators.required],
      repetirPassword: ['', Validators.required],
    });
  }

  cargarPerfil() {
    this.loading = true;
    this.perfilService.obtenerPerfil().subscribe({
      next: (res) => {
        this.perfilForm.patchValue(res);
        if (res.foto_perfil) {
          this.fotoPreview = `${this.perfilService.envs.url_image}${res.foto_perfil}`;
        }
      },
      error: (err) => Swal.fire('Error', 'No se pudo cargar el perfil', 'error'),
      complete: () => this.loading = false
    });
  }

  actualizarPerfil() {
    if (this.perfilForm.invalid) {
      Swal.fire('Atención', 'Por favor completa los campos requeridos', 'warning');
      return;
    }

    this.perfilService.actualizarPerfil(this.perfilForm.getRawValue()).subscribe({
      next: () => Swal.fire('Éxito', 'Perfil actualizado correctamente', 'success'),
      error: () => Swal.fire('Error', 'No se pudo actualizar el perfil', 'error')
    });
  }

  cambiarPassword() {
    if (this.passwordForm.invalid) {
      Swal.fire('Atención', 'Completa todos los campos', 'warning');
      return;
    }

    const { passwordActual, nuevaPassword, repetirPassword } = this.passwordForm.value;
    if (nuevaPassword !== repetirPassword) {
      Swal.fire('Atención', 'Las nuevas contraseñas no coinciden', 'warning');
      return;
    }

    this.perfilService.cambiarPassword({ passwordActual, nuevaPassword }).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Contraseña actualizada correctamente', 'success');
        this.passwordForm.reset();
      },
      error: (err) => Swal.fire('Error', err.error?.message || 'No se pudo actualizar la contraseña', 'error')
    });
  }

  seleccionarFoto(event: any) {
    const file = event.target.files[0];
    if (!file) {
      return; // Salimos si no hay archivo
    }

    // Validar tipo de archivo
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      Swal.fire('Error', 'Solo se permiten archivos jpg, jpeg o png', 'error');
      return; // Salimos si el archivo no es válido
    }

    // Preview de la imagen
    const reader = new FileReader();
    reader.onload = () => this.fotoPreview = reader.result;
    reader.readAsDataURL(file);

    // Subir la foto al backend
    this.perfilService.subirFoto(file).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Foto de perfil actualizada', 'success');
      },
      error: () => {
        Swal.fire('Error', 'No se pudo subir la foto', 'error');
      }
    });
  }
}
