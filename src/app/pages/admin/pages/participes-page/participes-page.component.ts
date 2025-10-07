import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';

@Component({
  selector: 'app-participes-page',
  imports: [ReactiveFormsModule,],
  templateUrl: './participes-page.component.html',
})
export class ParticipesPageComponent implements OnInit {
  // Variables
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  loading = true;
  mostrarModal = false;

  participes = [
    { nombre: 'Carlos Ramírez', correo: 'carlos.ramirez@example.com', rol: 'Árbitro Único', estado: 'Activo', expedientes: 5 },
    { nombre: 'María López', correo: 'maria.lopez@example.com', rol: 'Secretaria Arbitral', estado: 'Inactivo', expedientes: 2 },
    { nombre: 'José Fernández', correo: 'jose.fernandez@example.com', rol: 'Parte Demandante', estado: 'Activo', expedientes: 3 },
    { nombre: 'Ana Castillo', correo: 'ana.castillo@example.com', rol: 'Parte Demandada', estado: 'Activo', expedientes: 4 },
    { nombre: 'Ricardo Gómez', correo: 'ricardo.gomez@example.com', rol: 'Administrador', estado: 'Activo', expedientes: 10 },
    { nombre: 'Lucía Torres', correo: 'lucia.torres@example.com', rol: 'Secretaria Arbitral', estado: 'Suspendido', expedientes: 1 },
    { nombre: 'Pedro Huamán', correo: 'pedro.huaman@example.com', rol: 'Parte Demandante', estado: 'Activo', expedientes: 6 },
    { nombre: 'Rosa Gutiérrez', correo: 'rosa.gutierrez@example.com', rol: 'Árbitro', estado: 'Inactivo', expedientes: 0 },
    { nombre: 'Luis Cárdenas', correo: 'luis.cardenas@example.com', rol: 'Parte Demandada', estado: 'Activo', expedientes: 7 },
    { nombre: 'Elena Vargas', correo: 'elena.vargas@example.com', rol: 'Asistente Técnico', estado: 'Activo', expedientes: 2 },
  ];




  ngOnInit(): void {
    // Aquí puedes inicializar datos o lógica al cargar el componente
    this.loading = false;
  }
}
