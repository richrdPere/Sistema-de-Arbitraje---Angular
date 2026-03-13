import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Service
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';

@Component({
  selector: 'ver-historial',
  imports: [DatePipe, CommonModule],
  templateUrl: './ver-historial.component.html',
  styles: ``
})
export class VerHistorialComponent implements OnChanges {

  @Input() mostrarModal = false;
  @Input() expedienteId: number | null = null;

  @Output() modalCerrado = new EventEmitter<void>();

  historial: any;
  timeline: any[] = [];    // historial / eventos
  loading = true;

  // Ancho de modal
  modalWidthClass = 'max-w-4xl'; // default

  setModalWidth(size: 'sm' | 'md' | 'lg' | 'xl' | 'full') {
    const map = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full w-[95vw]'
    };

    this.modalWidthClass = map[size];
  }

  constructor(
    private route: ActivatedRoute,
    private expedienteService: ExpedientesService,
    private router: Router
  ) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expedienteId'] && this.expedienteId) {
      this.cargarHistorial();
      this.setModalWidth('full');
    }
  }
  // ngOnInit(): void {
  //   this.idExpediente = Number(this.route.snapshot.paramMap.get('id'));
  //   this.cargarHistorial();
  // }

  cargarHistorial() {
    this.loading = true;

    this.expedienteService.obtenerTrazabilidad(this.expedienteId!).subscribe({
      next: (data) => {
        this.historial = data;
        this.timeline = data.timeline || [];
        this.loading = false;
      },
      error: (err) => {

        this.loading = false;
      },
    });
  }

  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();

  }

  // volver() {
  //   this.router.navigate(['/app/expedientes']);
  // }
}
