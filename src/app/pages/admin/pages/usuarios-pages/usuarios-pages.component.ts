import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule, FormGroup } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';
import { CommonModule } from '@angular/common';

// Service
import { UsuarioService } from 'src/app/services/admin/usuarios.service';

@Component({
  selector: 'app-usuarios-pages',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './usuarios-pages.component.html',
})
export class UsuariosPagesComponent implements OnInit {

  // Usuarios combinados
  usuarios: any[] = [];


  // Usuarios
  // arbitros: any[] = [];
  // secretarias: any[] = [];
  // participes: any[] = [];

  // Variables
  formUsuario!: FormGroup;
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  loading = true;
  filtro: string = '';
  mostrarModal = false;

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.formUsuario = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rol: ['', Validators.required],
      telefono: [''],
      documento_identidad: [''],

      // Campos opcionales (dependen del rol)
      tipo_persona: [''],
      razon_social: [''],
      direccion: [''],
      cargo: [''],
      especialidad: [''],
      experiencia: [''],
    });

    // Opcional: limpiar campos cuando cambia el rol
    this.formUsuario.get('rol')?.valueChanges.subscribe(() => this.resetCamposRol());
    this.cargarDatos();
  }

  private resetCamposRol() {
    this.formUsuario.patchValue({
      tipo_persona: '',
      documento_identidad: '',
      razon_social: '',
      telefono: '',
      direccion: '',
      cargo: '',
      especialidad: '',
      experiencia: '',
    });
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.formUsuario.reset();
  }

  async cargarDatos(): Promise<void> {
    this.loading = true;

    try {
      const [arbitros, secretarias, participes] = await Promise.all([
        this.usuarioService.getArbitros().toPromise(),
        this.usuarioService.getSecretarias().toPromise(),
        this.usuarioService.getParticipes().toPromise(),
        this.usuarioService.getAdmins().toPromise(),
      ]);

      // Normalizamos los tres tipos
      const normalizar = (lista: any[], rol: string) => {
        return (lista || []).map(item => ({
          id: item.usuario?.id ?? null,
          nombre: item.usuario?.nombre ?? '',
          apellidos: item.usuario?.apellidos ?? '',
          correo: item.usuario?.correo ?? '',
          rol,
          cargo: item.cargo ?? '',
          estado: item.estado ?? 'Activo',
        }));
      };

      this.usuarios = [
        // ...normalizar(arbitros ?? [], 'Árbitro'),
        ...normalizar(secretarias ?? [], 'Secretaria'),
        // ...normalizar(participes ?? [], 'Partícipe'),
        ...normalizar(participes ?? [], 'Admins'),
      ];
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      this.loading = false;
    }
  }

  // // Combina todos los usuarios
  // get usuarios(): any[] {
  //   return [...this.arbitros, ...this.secretarias, ...this.participes];
  // }



  // Filtro por nombre o correo
  usuariosFiltrados(): any[] {
    if (!this.filtro.trim()) return this.usuarios;
    const filtroLower = this.filtro.toLowerCase();
    return this.usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(filtroLower) ||
        u.correo.toLowerCase().includes(filtroLower)
    );
  }


  // cerrar modal
  crearUsuario(): void {
    if (this.formUsuario.invalid) return;

    const usuario = this.formUsuario.value;

    console.log(`Usuarios: ${usuario}`);
    this.usuarioService.crearUsuario(usuario).subscribe({
      next: (res) => {
        alert(' Usuario creado correctamente');
        this.cerrarModal();
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        alert(' Error al crear usuario: ' + err.error?.message);
      },
    });
  }

  // usuarios = [
  //   {
  //     nombre: 'Andrés Morales',
  //     correo: 'andres.morales@example.com',
  //     rol: 'Administrador',
  //     estado: 'Activo'
  //   },
  //   {
  //     nombre: 'Patricia Ramos',
  //     correo: 'patricia.ramos@example.com',
  //     rol: 'Secretaria Arbitral',
  //     estado: 'Inactivo'
  //   },
  //   {
  //     nombre: 'Miguel Quispe',
  //     correo: 'miguel.quispe@example.com',
  //     rol: 'Árbitro',
  //     estado: 'Activo'
  //   },
  //   {
  //     nombre: 'Verónica Paredes',
  //     correo: 'veronica.paredes@example.com',
  //     rol: 'Parte Demandante',
  //     estado: 'Suspendido'
  //   },
  //   {
  //     nombre: 'Eduardo Salazar',
  //     correo: 'eduardo.salazar@example.com',
  //     rol: 'Parte Demandada',
  //     estado: 'Activo'
  //   }
  // ];




}
