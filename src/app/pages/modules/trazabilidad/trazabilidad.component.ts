import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Service
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { VerTrazabilidadComponent } from "./ver-trazabilidad/ver-trazabilidad.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-trazabilidad',
  imports: [CommonModule, FormsModule, VerTrazabilidadComponent],
  templateUrl: './trazabilidad.component.html',
  styles: ``
})
export class TrazabilidadComponent implements OnInit {


  loading = false;
  expedientes: any[] = [];
  trazabilidad: any[] = [];

  mostrarModal = false;
  expedienteId: number | null = null;

  filtroEstado = '';
  filtroSearch = '';



  // Paginado
  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  pageSizeOptions = [5, 10, 20, 50];

  onPageSizeChange() {
    this.currentPage = 1; // vuelve a la primera página
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.listarExpedientes();
  }

  cambiarLimite() {
    this.page = 1;
    this.listarExpedientes();
  }

  constructor(private expedientesService: ExpedientesService, private router: Router,) { }

  ngOnInit(): void {
    this.listarExpedientes();


  }

  listarExpedientes(): void {
    this.loading = true;

    this.expedientesService.listarExpedientes({
      page: this.page,
      limit: this.limit,
      search: this.filtroSearch?.trim() || undefined,
      estado: this.filtroEstado || undefined,
    }).subscribe({
      next: (resp) => {
        this.expedientes = resp.data;
        this.totalItems = resp.total;
        this.totalPages = resp.totalPages;
        this.currentPage = resp.page;

        //  AQUI enriquecemos cada expediente
        this.cargarPartesYResumen();


        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  cargarPartesYResumen() {
    this.expedientes.forEach((exp) => {

      this.expedientesService.obtenerPartesYResumen(exp.id_expediente)
        .subscribe({
          next: (resp) => {

            // =========================
            // DEMANDANTES
            // =========================
            exp.demandante = resp.partes?.demandantes?.length
              ? resp.partes.demandantes
                .map((d: any) =>
                  `${d.usuario?.nombre || ''} ${d.usuario?.apellidos || ''}`.trim()
                )
                .join(', ')
              : '—';

            // =========================
            // DEMANDADOS
            // =========================
            exp.demandado = resp.partes?.demandados?.length
              ? resp.partes.demandados
                .map((d: any) =>
                  `${d.usuario?.nombre || ''} ${d.usuario?.apellidos || ''}`.trim()
                )
                .join(', ')
              : '—';

            // =========================
            // ARBITROS
            // =========================
            exp.arbitros = resp.arbitros?.length
              ? resp.arbitros.map((a: any) => ({
                nombre: `${a.arbitro?.usuario?.nombre || ''} ${a.arbitro?.usuario?.apellidos || ''}`.trim(),
                rol: a.rol,
                estado: a.estado,
                cargo: a.arbitro?.cargo,
                especialidad: a.arbitro?.especialidad,
              }))
              : [];

            // =========================
            // ÚLTIMO MOVIMIENTO
            // =========================
            if (resp.ultimoMovimiento) {
              exp.ultimoMovimiento = resp.ultimoMovimiento.accion;
              exp.detalleUltimoMovimiento = resp.ultimoMovimiento.detalle;

              // Fecha completa (para pipe date)
              exp.fechaUltimoMovimiento = new Date(
                resp.ultimoMovimiento.fecha
              );
            } else {
              exp.ultimoMovimiento = '—';
              exp.detalleUltimoMovimiento = null;
              exp.fechaUltimoMovimiento = null;
            }
          },
          error: () => {
            exp.demandante = '—';
            exp.demandado = '—';
            exp.arbitros = [];
          exp.arbitrosResumen = '—';
            exp.ultimoMovimiento = '—';
            exp.detalleUltimoMovimiento = null;
            exp.fechaUltimoMovimiento = null;
          }
        });

    });
  }

  get expedientesFiltrados() {
    return this.expedientes.filter(e => {
      const coincideEstado = this.filtroEstado
        ? e.estadoProcesal === this.filtroEstado
        : true;

      const coincideBusqueda = this.filtroSearch
        ? e.codigoExpediente.toLowerCase().includes(this.filtroSearch.toLowerCase())
        : true;

      return coincideEstado && coincideBusqueda;
    });
  }

  getBadgeEstado(estado: string): string {
    const map: Record<string, string> = {
      'Suspendido': 'badge badge-soft badge-error font-semibold',
      'En espera': 'badge badge-soft badge-neutral font-semibold',
      'En trámite': 'badge badge-soft badge-info font-semibold',
      'Concluido': 'badge badge-soft badge-success font-semibold',
      'Archivado': 'badge badge-soft badge-outline font-semibold',
    };

    return map[estado] ?? 'badge badge-soft badge-ghost font-semibold';
  }

  getBadgeEstadoProcesal(estado: string): string {

    //  FASE INICIAL
    const inicial = [
      'Prearbitral',
      'Instalación',
      'Postulatoria'
    ];

    //  TRÁMITE / PRUEBA
    const tramite = [
      'Fijación de puntos controvertidos',
      'Admisión de medios probatorios',
      'Actuación pericial',
      'Actuación probatoria',
      'Cierre de etapa probatoria'
    ];

    //  AUDIENCIA / ALEGATOS
    const audiencia = [
      'Alegatos',
      'Audiencia'
    ];

    //  PLAZOS FINALES
    const plazos = [
      'Plazo para laudar',
      'Plazo para resolver pedido contra Laudo Arbitral'
    ];

    //  CONCLUSIÓN
    const concluido = [
      'Concluido con Laudo Arbitral Consentido',
      'Concluido con pedido contra Laudo Arbitral'
    ];

    //  INCIDENCIAS (alertas)
    const incidencias = [
      'Recusación de arbitro',
      'Recusación de adjudicador',
      'Reconstitución de Tribunal Arbitral',
      'Reconstitución de JPRD'
    ];

    if (inicial.includes(estado)) return 'badge badge-soft badge-success font-semibold';
    if (tramite.includes(estado)) return 'badge badge-soft badge-warning font-semibold';
    if (audiencia.includes(estado)) return 'badge badge-soft badge-accent font-semibold';
    if (plazos.includes(estado)) return 'badge badge-soft badge-secondary font-semibold';
    if (concluido.includes(estado)) return 'badge badge-soft badge-success font-semibold';
    if (incidencias.includes(estado)) return 'badge badge-soft badge-error font-semibold';

    return 'badge badge-ghost';
  }



  verTrazabilidad(exp: any) {
    this.expedienteId = exp.id_expediente;
    this.mostrarModal = true;
  }

  verDocumentos(exp: any) {
    this.router.navigate([`app/trazabilidad/${exp.id_expediente}/documentos`]);
  }


  cerrarModal() {
    this.mostrarModal = false;
    this.expedienteId = null;
  }

}
