import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FirebaseService, AppService } from '@app/services';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {

  public authState = AuthState;
  public state: AuthState = AuthState.Login;
  public errorMessage: string = null;

  constructor(
    private firebase: FirebaseService,
    private app: AppService
  ) { }

  public recover(form: NgForm): void {

    if ( form.invalid ) return;

    this.state = 4;
    this.errorMessage = null;

    this.firebase.sendPasswordResetEmail(form.value.email)
    .then(() => {

      this.state = 5;

    })
    .catch(error => {

      this.state = 3;
      this.errorMessage = this.app.getErrorMessage(error.code);

    });

  }

  public login(form: NgForm): void {

    if ( form.invalid ) return;

    this.state = 4;
    this.errorMessage = null;

    this.firebase.login(form.value.email, form.value.password)
    .catch(error => {

      this.state = 1;
      this.errorMessage = this.app.getErrorMessage(error.code);

    });

  }

  public signup(form: NgForm): void {

    if ( form.invalid ) return;

    this.state = 4;
    this.errorMessage = null;

    this.firebase.signup(form.value.email, form.value.password)
    .catch(error => {

      this.state = 2;
      this.errorMessage = this.app.getErrorMessage(error.code);

    });

  }

  public switchState(state: AuthState): void {

    this.state = state;
    this.errorMessage = null;

  }

}

enum AuthState {

  Login,
  Signup,
  PasswordReset,
  EmailSent,
  Loading

}
