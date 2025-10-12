import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  fb = inject(FormBuilder);

  public user: any = {};
  public token: any = '';

   constructor(
    // private _adminService: AdminService,
    private _router: Router
  ) {
    //this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    console.log(this.token);

    if (this.token) {
      this._router.navigate(['/admin']);
    }
    else {
      // Mantener en el componente login
    }
  }

}
