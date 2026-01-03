import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Service
import { ParticipeService } from 'src/app/services/admin/participes.service';

// Interface
import { Participe } from 'src/app/interfaces/users/participeUser';
import { ParticipeModalComponent } from "./participe-modal/participe-modal.component";

@Component({
  selector: 'app-participes',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, ParticipeModalComponent],
  templateUrl: './participes.component.html',
  styles: ``
})
export class ParticipesComponent implements OnInit {

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
  modoEdicion = false;
  mostrarModal = false;
  participeSeleccionado: any | null = null;

  // Paginación
  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;

    pageSizeOptions = [5, 10, 20, 50];

  // Filtros
  rolParticipeFiltro: string = '';
  search: string = '';


  menuAbierto: number | null = null;
  seleccionado?: Participe;

  toggleDropdown(index: number, event: MouseEvent) {
    // Si se vuelve a hacer click en el mismo menú, se cierra
    event.stopPropagation(); // Evita que se cierre inmediatamente
    this.menuAbierto = this.menuAbierto === index ? null : index;
  }

  cerrarDropdown() {
    this.menuAbierto = null;
  }

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


    this.cargarParticipes();

  }

  abrirModal() {
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.formParticipe.reset();
  }

  onFiltroChange() {
    this.page = 1;
    this.cargarParticipes();
  }

  // Funciones del Service
  cargarParticipes(): void {
    this.loading = true;

    this.participeService.getParticipesPaginado({
      page: this.page,
      limit: this.limit,
      rol_participe: this.rolParticipeFiltro || undefined,
      search: this.search?.trim() || undefined,
    }).subscribe({
      next: (res) => {

        console.log("RES: ", res)
        this.participes = res.data;
        this.totalItems = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar partícipes:', err);
        this.loading = false;
      }
    });
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.cargarParticipes();
  }

  cambiarLimite() {
    this.page = 1;
    this.cargarParticipes();
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


  //  Ver detalles de un participe
  verParticipe(participe: Participe): void {
    Swal.fire({
      title: 'Información del Partícipe',
      html: `
          <div style="text-align: left;">
            <b>Nombre:</b> ${participe.usuario?.nombre || ''} ${participe.usuario?.apellidos || ''}<br>
            <b>Correo:</b> ${participe.usuario?.correo || ''}<br>
            <b>Teléfono:</b> ${participe.usuario?.telefono || '-'}<br><br>
            <b>Rol en el Sistema:</b> ${participe.usuario?.rol || '-'}<br>
            <b>Rol en el Proceso:</b> ${participe.rol_participe || '-'}<br>
            <b>Cargo:</b> ${participe.cargo || '-'}<br>
            <b>Tipo de Usuario:</b> ${participe.tipo_usuario || '-'}<br>
            <b>Estado:</b> ${participe.estado || '-'}
          </div>
        `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }
  editarParticipe(participe: Participe): void {
    this.modoEdicion = true;
    this.participeSeleccionado = participe;
    this.mostrarModal = true;

    // Llenar el formulario con los datos del participante
    this.formParticipe.patchValue({
      nombre: participe.usuario?.nombre,
      apellidos: participe.usuario?.apellidos,
      correo: participe.usuario?.correo,
      telefono: participe.usuario?.telefono,
      cargo: participe.cargo,
      rol_participe: participe.rol_participe,
    });
    // if (!this.participeSeleccionado) return;

    // const id = this.participeSeleccionado.id_participe;
    // const cambios = this.formParticipe.value;

    // this.participeService.actualizarParticipe(id, cambios).subscribe({
    //   next: (data) => {
    //     Swal.fire('Actualizado', 'El participante fue actualizado correctamente.', 'success');
    //     this.cargarParticipes();
    //   },
    //   error: (err) => {
    //     console.error('Error al editar participante:', err);
    //     Swal.fire('Error', 'No se pudo actualizar el participante.', 'error');
    //   },
    // });
  }

  //  Nuevo método para guardar cambios
  guardarEdicion(): void {
    if (!this.participeSeleccionado) return;

    const id = this.participeSeleccionado.id_participe;
    const cambios = this.formParticipe.value;

    this.participeService.actualizarParticipe(id, cambios).subscribe({
      next: () => {
        Swal.fire('Actualizado', 'El partícipe fue actualizado correctamente.', 'success');
        this.mostrarModal = false;
        this.cargarParticipes();
      },
      error: (err) => {
        console.error('Error al editar participante:', err);
        Swal.fire('Error', 'No se pudo actualizar el participante.', 'error');
      },
    });
  }

  //  Eliminar participante
  eliminarParticipe(id: number): void {
    Swal.fire({
      title: '¿Eliminar participante?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.participeService.eliminarParticipe(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El participante ha sido eliminado.', 'success');
            this.cargarParticipes();
          },
          error: (err) => {
            console.error('Error al eliminar participante:', err);
            Swal.fire('Error', 'No se pudo eliminar el participante.', 'error');
          },
        });
      }
    });
  }

}
