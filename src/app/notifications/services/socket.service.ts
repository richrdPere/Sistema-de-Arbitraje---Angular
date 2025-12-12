import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  connect(serverUrl: string, opts: any = {}) {
    if (this.socket) return;
    this.socket = io(serverUrl, { transports: ['websocket'], ...opts });
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  joinRoom(room: string) {
    this.socket?.emit('join', room);
  }

  leaveRoom(room: string) {
    this.socket?.emit('leave', room);
  }

  on<T = any>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      this.socket?.on(event, (payload: T) => subscriber.next(payload));
      return () => this.socket?.off(event);
    });
  }

  emit(event: string, payload?: any) {
    this.socket?.emit(event, payload);
  }
}
