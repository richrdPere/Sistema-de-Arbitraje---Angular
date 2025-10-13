import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ViewChild, ElementRef } from '@angular/core';
import { FormUtils } from 'src/app/utils/form-utils';

// Service
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {

  usuario!: AuthService;
  usuarioEditable!: AuthService; // copia temporal para editar
  archivoSeleccionado: File | null = null;
  avatar: string = ''; // URL actual del avatar

  @ViewChild('inputAvatar') inputAvatar!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
