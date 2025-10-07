import { Component,OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';


@Component({
  selector: 'app-usuarios-pages',
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios-pages.component.html',
})
export class UsuariosPagesComponent implements OnInit {

  // Variables
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  loading = true;
  mostrarModal = false;

  usuarios = [
  {
    nombre: 'Andrés Morales',
    correo: 'andres.morales@example.com',
    rol: 'Administrador',
    estado: 'Activo'
  },
  {
    nombre: 'Patricia Ramos',
    correo: 'patricia.ramos@example.com',
    rol: 'Secretaria Arbitral',
    estado: 'Inactivo'
  },
  {
    nombre: 'Miguel Quispe',
    correo: 'miguel.quispe@example.com',
    rol: 'Árbitro',
    estado: 'Activo'
  },
  {
    nombre: 'Verónica Paredes',
    correo: 'veronica.paredes@example.com',
    rol: 'Parte Demandante',
    estado: 'Suspendido'
  },
  {
    nombre: 'Eduardo Salazar',
    correo: 'eduardo.salazar@example.com',
    rol: 'Parte Demandada',
    estado: 'Activo'
  }
];



  ngOnInit(): void {
    this.loading = false;
  }
}
