import { Component, OnInit, OnDestroy, ElementRef, HostListener  } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common'; // <--- IMPORTANTE
import { DatePipe } from '@angular/common';

// Modelos
import { Notificacion } from '../../models/notification.model';

// Service
import { NotificationService } from '../../services/notification.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-notification-bell',
  imports: [DatePipe, NgClass],
  templateUrl: './notification-bell.component.html',
  styles: ``
})
export class NotificationBellComponent implements OnInit, OnDestroy {

  notificaciones: Notificacion[] = [];
  unread = 0;
  subs: Subscription[] = [];
  userId: number | null = null;

  private socketSub!: Subscription;

  dropdownOpen = false;

  constructor(private notiService: NotificationService,
    private authService: AuthService,
    private eRef: ElementRef
  ) { }

  ngOnInit() {
    const user = this.authService.getUser();
    if (!user) return;

    // obtener userId desde tu Auth Service o localStorage
    this.userId = user.id;
    if (!this.userId) return;

    // inicializar socket
    this.notiService.initSocket(this.userId);

    // 1. Cargar notificaciones ya guardadas
    // this.notiService.getNotificaciones(userId).subscribe(res => {
    //   this.notifications = res;
    //   this.unreadCount = res.filter(n => !n.leido).length;
    // });

    // // 2. Escuchar nuevas notificaciones por Socket.IO
    // this.socketSub = this.notificationService.listenForNotifications()
    //   .subscribe((notification: any) => {

    //     // Solo mostrar si es para el usuario logueado
    //     if (notification.destinatario_id === userId) {
    //       this.notifications.unshift(notification);
    //       this.unreadCount++;
    //     }
    //   });

    this.notiService.getNotificaciones(this.userId).subscribe();

    this.subs.push(this.notiService.notificaciones$.subscribe((list) => {
      this.notificaciones = list;
      this.unread = list.filter((n: any) => !n.leido).length;
    }));
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen && this.userId) {
      // opcional: marcar todas como leídas al abrir
      // this.notiService.marcarTodasLeidas(this.userId).subscribe();
    }
  }

  //  Cerrar dropdown si el usuario hace click fuera
  @HostListener('document:click', ['$event'])
  clickFuera(event: Event) {
    // Si haces click fuera del componente → cerrar
    if (this.dropdownOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  marcarLeido(n: Notificacion) {
    if (!n.leido) {
      this.notiService.marcarLeido(n.id_notificacion).subscribe();
    }
  }

  aceptar(n: Notificacion) {
    // asumo payload.designacion_arbitro_id
    const id = n.payload?.designacion_arbitro_id;
    if (!id) return;
    this.notiService.aceptarDesignacion(id).subscribe(() => {
      // marcar noti como leída y actualizar UI
      this.notiService.marcarLeido(n.id_notificacion).subscribe();
    });
  }

  rechazar(n: Notificacion) {
    const id = n.payload?.designacion_arbitro_id;
    if (!id) return;
    this.notiService.rechazarDesignacion(id).subscribe(() => {
      this.notiService.marcarLeido(n.id_notificacion).subscribe();
    });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.notiService.disconnectSocket();
  }
}
