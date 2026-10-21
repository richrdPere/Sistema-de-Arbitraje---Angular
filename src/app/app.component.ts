import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, fromEvent, merge, takeUntil, timer } from 'rxjs';

import { AuthService } from 'src/app/pages/auth/services/auth.service';
import { AuthStorageService } from 'src/app/core/auth/auth-storage.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  title = 'front-arbitraje';
  private readonly destroySesion$ = new Subject<void>();

  constructor(
    private readonly authStorage: AuthStorageService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.iniciarVigilanciaSesion();
  }

  // *********************************************************
  // VIGILAR EXPIRACIÓN DE LA SESIÓN
  // *********************************************************

  private iniciarVigilanciaSesion(): void {
    if (
      typeof window === 'undefined' ||
      typeof document === 'undefined'
    ) {
      return;
    }

    merge(
      // Revisar al iniciar y aproximadamente cada segundo.
      timer(0, 1000),

      // Revisar también al regresar al navegador o a la pestaña.
      fromEvent(window, 'focus'),
      fromEvent(document, 'visibilitychange'),
    )
      .pipe(
        takeUntil(this.destroySesion$),
      )
      .subscribe(() => {
        this.verificarExpiracionSesion();
      });
  }

  // *********************************************************
  // CERRAR SESIÓN EXPIRADA
  // *********************************************************

  private verificarExpiracionSesion(): void {
    // No redirigir a visitantes que no han iniciado sesión.
    if (!this.authStorage.getSession()) {
      return;
    }

    if (!this.authStorage.isAccessTokenExpired(0)) {
      return;
    }

    // Primero limpiar: las siguientes comprobaciones
    // ya no encontrarán una sesión expirada.
    this.authService.closeLocalSession();

    void this.router.navigate(
      ['/auth/login'],
      {
        replaceUrl: true,
      },
    );
  }

  // *********************************************************
  // DESTRUIR SUSCRIPCIONES
  // *********************************************************
  ngOnDestroy(): void {
    this.destroySesion$.next();
    this.destroySesion$.complete();
  }
}
