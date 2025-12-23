// services/acta-instalacion.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ActaInstalacion, Expediente, Notificacion } from '../interfaces/acta-instalacion.model';


@Injectable({
  providedIn: 'root'
})
export class ActaInstalacionService {
  private apiUrl = 'http://localhost:3000/api/actas-instalacion';
  private wsUrl = 'ws://localhost:3000'; // WebSocket para notificaciones en tiempo real

  // Estados reactivos
  private actasSignal = signal<ActaInstalacion[]>([]);
  private expedientesSignal = signal<Expediente[]>([]);
  private notificacionesSignal = signal<Notificacion[]>([]);

  // Getters reactivos
  actas = this.actasSignal.asReadonly();
  expedientes = this.expedientesSignal.asReadonly();
  notificaciones = this.notificacionesSignal.asReadonly();

  constructor(private http: HttpClient) {
    this.cargarDatosIniciales();
    this.iniciarWebSocket();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ========================================================
  // 1. CONVOCAR AUDIENCIA (Secretaría)
  // ========================================================
  convocarAudiencia(data: {
    expediente_id: number;
    fecha_convocatoria: Date;
    hora_convocatoria: string;
    mensaje: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/convocar`, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response: any) => {
        // this.agregarNotificacion({
        //   titulo: 'Audiencia Convocada',
        //   mensaje: `Se ha convocado audiencia para el expediente ${data.expediente_id}`,
        //   tipo: 'audiencia',
        //   leida: false
        // });
      })
    );
  }

  // ========================================================
  // 2. INICIAR INSTALACIÓN (Árbitro)
  // ========================================================
  iniciarInstalacion(acta_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/iniciar`, { acta_id }, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response: any) => {
        this.actualizarActa(response.acta);
      })
    );
  }

  // ========================================================
  // 3. GUARDAR ACTA (Árbitro)
  // ========================================================
  guardarActa(data: {
    acta_id: number;
    competencia: string;
    normas_procesales: string[];
    cronograma_inicial: any;
    observaciones?: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/guardar`, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response: any) => {
        this.actualizarActa(response.acta);
      })
    );
  }

  // ========================================================
  // 4. FINALIZAR ACTA (Árbitro)
  // ========================================================
  finalizarActa(acta_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/finalizar`, { acta_id }, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response: any) => {
        this.actualizarActa(response.acta);
        // this.agregarNotificacion({
        //   titulo: 'Acta Finalizada',
        //   mensaje: 'El Tribunal Arbitral ha sido formalmente instalado',
        //   tipo: 'acta',
        //   leida: false
        // });
      })
    );
  }

  // ========================================================
  // CONSULTAS
  // ========================================================
  obtenerActasPorEstado(estado: string): Observable<ActaInstalacion[]> {
    return this.http.get<ActaInstalacion[]>(`${this.apiUrl}/estado/${estado}`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerActaPorId(id: number): Observable<ActaInstalacion> {
    return this.http.get<ActaInstalacion>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerExpedientesPendientes(): Observable<Expediente[]> {
    return this.http.get<Expediente[]>('http://localhost:3000/api/expedientes/pendientes', {
      headers: this.getAuthHeaders()
    });
  }

  // ========================================================
  // HELPERS Y ESTADO LOCAL
  // ========================================================
  private cargarDatosIniciales() {
    // Datos de prueba
    const expedientesPrueba: Expediente[] = [
      {
        id: 1,
        numero_expediente: 'EXP-2024-001',
        titulo: 'Conflicto Comercial Internacional',
        estado: 'en_proceso',
        arbitro_id: 2,
        secretaria_id: 1,
        created_at: new Date('2024-01-15')
      },
      {
        id: 2,
        numero_expediente: 'EXP-2024-002',
        titulo: 'Disputa Societaria',
        estado: 'registrado',
        arbitro_id: 3,
        secretaria_id: 1,
        created_at: new Date('2024-02-01')
      },
      {
        id: 3,
        numero_expediente: 'EXP-2024-003',
        titulo: 'Contrato de Suministro',
        estado: 'pendiente',
        secretaria_id: 1,
        created_at: new Date('2024-02-10')
      }
    ];

    const actasPrueba: ActaInstalacion[] = [
      {
        id: 1,
        expediente_id: 1,
        arbitro_id: 2,
        secretaria_id: 1,
        fecha_convocatoria: new Date('2024-02-20'),
        hora_convocatoria: '10:00',
        fecha_instalacion: new Date('2024-02-20'),
        competencia: 'El tribunal arbitral es competente para conocer la controversia derivada del contrato suscrito entre las partes.',
        normas_procesales: ['Reglamento de Arbitraje', 'Código Procesal Civil', 'Reglas IBA'],
        cronograma_inicial: {
          fecha_presentacion_demanda: new Date('2024-02-25'),
          fecha_contestacion: new Date('2024-03-10'),
          fecha_audiencia_preliminar: new Date('2024-03-25'),
          fecha_laudo: new Date('2024-06-30')
        },
        estado: 'instalada',
        created_at: new Date('2024-02-15')
      }
    ];

    this.expedientesSignal.set(expedientesPrueba);
    this.actasSignal.set(actasPrueba);
  }

  private actualizarActa(actaActualizada: ActaInstalacion) {
    const actas = this.actasSignal();
    const index = actas.findIndex(a => a.id === actaActualizada.id);

    if (index !== -1) {
      const nuevasActas = [...actas];
      nuevasActas[index] = actaActualizada;
      this.actasSignal.set(nuevasActas);
    } else {
      this.actasSignal.set([...actas, actaActualizada]);
    }
  }

  private agregarNotificacion(notificacion: Omit<Notificacion, 'id' | 'created_at'>) {
    const nuevasNotificaciones = [...this.notificacionesSignal()];
    const nuevaNotif: Notificacion = {
      ...notificacion,
      id: nuevasNotificaciones.length + 1,
      created_at: new Date()
    };
    this.notificacionesSignal.set([nuevaNotif, ...nuevasNotificaciones]);
  }

  private iniciarWebSocket() {
    const ws = new WebSocket(this.wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // if (data.tipo === 'nueva_notificacion') {
      //   this.agregarNotificacion({
      //     titulo: data.titulo,
      //     mensaje: data.mensaje,
      //     tipo: data.tipo || 'sistema',
      //     leida: false
      //   });
      // }
    };
  }

  // Métodos de utilidad
  getEstadoTexto(estado: string): string {
    const estados: { [key: string]: string } = {
      'convocada': 'Convocada',
      'en_proceso': 'En Proceso',
      'instalada': 'Instalada',
      'cancelada': 'Cancelada'
    };
    return estados[estado] || estado;
  }

  getColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'convocada': 'badge-warning',
      'en_proceso': 'badge-info',
      'instalada': 'badge-success',
      'cancelada': 'badge-error'
    };
    return colores[estado] || 'badge-neutral';
  }
}
