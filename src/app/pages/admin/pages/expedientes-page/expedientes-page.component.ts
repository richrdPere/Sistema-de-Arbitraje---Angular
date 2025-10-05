import { Component, OnInit } from '@angular/core';

import { ExpedientesService, Expediente } from '../../../../services/admin/expedientes.service';
import { DatePipe } from '@angular/common';
import { FormExpedienteModalComponent } from "./form-expediente-modal/form-expediente-modal.component";


@Component({
  selector: 'app-expedientes-page',
  imports: [DatePipe, FormExpedienteModalComponent],
  templateUrl: './expedientes-page.component.html',
  styleUrls: ['./expedientes-page.component.css']
})
export class ExpedientesPageComponent implements OnInit {
  expedientes: Expediente[] = [];
  loading = true;
  mostrarModal = false;
  constructor(private expedienteService: ExpedientesService) {

  }

  ngOnInit(): void {
    this.loadExpedientes();
  }

  loadExpedientes() {
    this.expedienteService.getExpedientes().subscribe({
      next: (data) => {
        this.expedientes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar expedientes', err);
        this.loading = false;
      }
    });
  }


}
