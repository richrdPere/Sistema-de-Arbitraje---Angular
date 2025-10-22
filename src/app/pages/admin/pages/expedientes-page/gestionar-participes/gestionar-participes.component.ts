import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'gestionar-participes',
  imports: [ReactiveFormsModule],
  templateUrl: './gestionar-participes.component.html',
})
export class GestionarParticipes implements OnInit {

  @Input() mostrar = false;
  @Input() idExpediente!: number;
  @Output() cerrar = new EventEmitter<void>(); // Emite cuando se cierra el modal

  // listas de selección (puedes traerlas del servicio)
  posiblesParticipes = [
    { id: 1, nombre: 'Partícipe de pruebas' },
    { id: 2, nombre: 'Ejemplo' },
    { id: 3, nombre: 'Cliente Demo' },
  ];

  posiblesAdjudicadores = [
    { id: 11, nombre: 'Adjudicador A' },
  ];

  posiblesArbitros = [
    { id: 21, nombre: 'Árbitro Principal' },
  ];

  posiblesSecretarios = [
    { id: 31, nombre: 'Secretario A' },
  ];

  // seleccionados temporales en selects
  selectedDemandante: any = null;
  selectedDemandado: any = null;
  selectedAdjudicador: any = null;
  selectedArbitro: any = null;
  selectedSecretario: any = null;

  // listas asignadas
  demandantes: any[] = [];
  demandados: any[] = [];
  adjudicadores: any[] = [];
  arbitros: any[] = [];
  secretarios: any[] = [];


  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  // Métodos de agregar
  agregarDemandante() {
    if (!this.selectedDemandante) return;
    // evitar duplicados por id:
    if (this.demandantes.find(p => p.id === this.selectedDemandante.id)) return;
    this.demandantes.push(this.selectedDemandante);
    this.selectedDemandante = null;
  }

  agregarDemandado() {
    if (!this.selectedDemandado) return;
    if (this.demandados.find(p => p.id === this.selectedDemandado.id)) return;
    this.demandados.push(this.selectedDemandado);
    this.selectedDemandado = null;
  }

  agregarAdjudicador() {
    if (!this.selectedAdjudicador) return;
    if (this.adjudicadores.find(p => p.id === this.selectedAdjudicador.id)) return;
    this.adjudicadores.push(this.selectedAdjudicador);
    this.selectedAdjudicador = null;
  }

  agregarArbitro() {
    if (!this.selectedArbitro) return;
    if (this.arbitros.find(p => p.id === this.selectedArbitro.id)) return;
    this.arbitros.push(this.selectedArbitro);
    this.selectedArbitro = null;
  }

  agregarSecretario() {
    if (!this.selectedSecretario) return;
    if (this.secretarios.find(p => p.id === this.selectedSecretario.id)) return;
    this.secretarios.push(this.selectedSecretario);
    this.selectedSecretario = null;
  }

  // Métodos de eliminar
  eliminarDemandante(idx: number) { this.demandantes.splice(idx, 1); }
  eliminarDemandado(idx: number) { this.demandados.splice(idx, 1); }
  eliminarAdjudicador(idx: number) { this.adjudicadores.splice(idx, 1); }
  eliminarArbitro(idx: number) { this.arbitros.splice(idx, 1); }
  eliminarSecretario(idx: number) { this.secretarios.splice(idx, 1); }

  // Guardar (aquí llamarías a tu servicio backend)
  guardar() {
    const payload = {
      expedienteId: this.idExpediente,
      demandantes: this.demandantes.map(p => p.id),
      demandados: this.demandados.map(p => p.id),
      adjudicadores: this.adjudicadores.map(p => p.id),
      arbitros: this.arbitros.map(p => p.id),
      secretarios: this.secretarios.map(p => p.id),
    };

    console.log('Guardar payload:', payload);
    // Llamada a servicio: this.expedienteService.guardarParticipes(payload).subscribe(...)
    // this.cerrar();
  }

  cerrarModal() {
    this.cerrar.emit();
    // opcional: emitir evento al padre para recargar lista
  }

}
