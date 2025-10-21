import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Service
import { ParticipeService } from 'src/app/services/admin/participes.service';
import { ParticipesModalComponent } from "./participes-modal/participes-modal.component";

@Component({
  selector: 'app-participes-page',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, ParticipesModalComponent],
  templateUrl: './participes-page.component.html',
})
export class ParticipesPageComponent implements OnInit {

  // Participes
  participes: any[] = [];

  // Variables
  formParticipe!: FormGroup;
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  loading = true;
  mensajeError = '';
  mensajeExito = '';
  filtro: string = '';
  mostrarModal = false;

  constructor(private participeService: ParticipeService, private router: Router) { }

  ngOnInit(): void {
    // Aquí puedes inicializar datos o lógica al cargar el componente
    // this.loading = false;

    this.formParticipe = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      cargo: ['', [Validators.required]],
      rol_participe: ['', [Validators.required]],
      rol: ['participe'], // rol fijo para crear usuarios de tipo participe
    });


    this.cargarDatos();

  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.formParticipe.reset();
  }


  cargarDatos(): void {
    this.loading = true;

    this.participeService.obtenerParticipes().subscribe({
      next: (res) => {
        this.participes = res,
          this.loading = false
      },
      error: (err) => console.error('Error al cargar participes:', err)

    });
  }

  //  Método para enviar el formulario
  crearParticipe(): void {
    if (this.formParticipe.invalid) {
      this.mensajeError = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    this.loading = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.participeService.crearParticipe(this.formParticipe.value).subscribe({
      next: (resp) => {
        this.loading = false;
        this.mensajeExito = ' Partícipe creado exitosamente.';
        console.log('Partícipe creado:', resp);

        // Puedes redirigir a la lista
        setTimeout(() => {
          this.router.navigate(['/participes']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al crear el partícipe:', err);
        this.mensajeError =
          err.error?.message || ' Ocurrió un error al crear el partícipe.';
      },
    });
  }

  // participes = [
  //   { nombre: 'Carlos Ramírez', correo: 'carlos.ramirez@example.com', rol: 'Árbitro Único', estado: 'Activo', expedientes: 5 },
  //   { nombre: 'María López', correo: 'maria.lopez@example.com', rol: 'Secretaria Arbitral', estado: 'Inactivo', expedientes: 2 },
  //   { nombre: 'José Fernández', correo: 'jose.fernandez@example.com', rol: 'Parte Demandante', estado: 'Activo', expedientes: 3 },
  //   { nombre: 'Ana Castillo', correo: 'ana.castillo@example.com', rol: 'Parte Demandada', estado: 'Activo', expedientes: 4 },
  //   { nombre: 'Ricardo Gómez', correo: 'ricardo.gomez@example.com', rol: 'Administrador', estado: 'Activo', expedientes: 10 },
  //   { nombre: 'Lucía Torres', correo: 'lucia.torres@example.com', rol: 'Secretaria Arbitral', estado: 'Suspendido', expedientes: 1 },
  //   { nombre: 'Pedro Huamán', correo: 'pedro.huaman@example.com', rol: 'Parte Demandante', estado: 'Activo', expedientes: 6 },
  //   { nombre: 'Rosa Gutiérrez', correo: 'rosa.gutierrez@example.com', rol: 'Árbitro', estado: 'Inactivo', expedientes: 0 },
  //   { nombre: 'Luis Cárdenas', correo: 'luis.cardenas@example.com', rol: 'Parte Demandada', estado: 'Activo', expedientes: 7 },
  //   { nombre: 'Elena Vargas', correo: 'elena.vargas@example.com', rol: 'Asistente Técnico', estado: 'Activo', expedientes: 2 },
  // ];




}
