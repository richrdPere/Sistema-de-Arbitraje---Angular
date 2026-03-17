import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesRefreshService {

  private refreshSource = new Subject<void>();

  refresh$ = this.refreshSource.asObservable();

  emitirActualizacion() {
    this.refreshSource.next();
  }

}
