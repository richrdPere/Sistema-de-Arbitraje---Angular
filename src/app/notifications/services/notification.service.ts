import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Notificacion } from '../models/notification.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { SocketService } from './socket.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private API = '/api/notificaciones'; // ajusta base si lo deseas
  private socketUrl = window.location.origin; // o 'https://mi-backend:4000'
  private _notificaciones$ = new BehaviorSubject<Notificacion[]>([]);
  public notificaciones$ = this._notificaciones$.asObservable();

  constructor(private http: HttpClient, private socketService: SocketService) {}

  // Inicializar conexión en login/dashboard
  initSocket(userId: number) {
    this.socketService.connect(this.socketUrl);
    this.socketService.joinRoom(`user_${userId}`);
    this.socketService.on<Notificacion>('nueva_notificacion')
      .subscribe((n) => {
        // añadir al inicio
        const current = this._notificaciones$.value;
        this._notificaciones$.next([n, ...current]);
      });
  }

  disconnectSocket() {
    this.socketService.disconnect();
  }

  // API: obtener notificaciones del usuario
  getNotificaciones(usuarioId: number, page = 1, limit = 20): Observable<{ total:number; items: Notificacion[] }> {
    return this.http.get<{ total:number; items: Notificacion[] }>(`${this.API}/usuario/${usuarioId}?page=${page}&limit=${limit}`)
      .pipe(tap(res => {
        if (page === 1) { // primera página -> replace
          this._notificaciones$.next(res.items);
        } else {
          // append
          this._notificaciones$.next([...this._notificaciones$.value, ...res.items]);
        }
      }));
  }

  // marcar una notificación como leída
  marcarLeido(id_notificacion: number): Observable<any> {
    return this.http.put(`${this.API}/${id_notificacion}/leido`, {}).pipe(
      tap(() => {
        const updated = this._notificaciones$.value.map(n => n.id_notificacion === id_notificacion ? { ...n, leido: true } : n);
        this._notificaciones$.next(updated);
      })
    );
  }

  // marcar todas como leídas
  marcarTodasLeidas(usuarioId: number): Observable<any> {
    return this.http.put(`${this.API}/usuario/${usuarioId}/leido`, {}).pipe(
      tap(() => {
        const updated = this._notificaciones$.value.map(n => ({ ...n, leido: true }));
        this._notificaciones$.next(updated);
      })
    );
  }

  // aceptar designación (llama a endpoint de designacion)
  aceptarDesignacion(designacionArbitroId: number): Observable<any> {
    return this.http.put(`/api/designacion-arbitro/${designacionArbitroId}/aceptar`, {});
  }

  rechazarDesignacion(designacionArbitroId: number): Observable<any> {
    return this.http.put(`/api/designacion-arbitro/${designacionArbitroId}/rechazar`, {});
  }

  // helper: contar no leídas
  getUnreadCount(): number {
    return this._notificaciones$.value.filter(n => !n.leido).length;
  }
}
