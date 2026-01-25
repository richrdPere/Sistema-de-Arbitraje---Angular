import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Service
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';

@Component({
  selector: 'app-ver-historial',
  imports: [DatePipe],
  templateUrl: './ver-historial.component.html',
  styles: ``
})
export class VerHistorialComponent implements OnInit {

  idExpediente!: number;
  historial: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private expedienteService: ExpedientesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.idExpediente = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.expedienteService.obtenerHistorial(this.idExpediente).subscribe({
      next: (data) => {
        this.historial = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial', err);
        this.loading = false;
      },
    });
  }

  volver() {
    this.router.navigate(['/app/expedientes']);
  }
}
