import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public noAuth: boolean = true;
  public authenticated: boolean = false;

  constructor(
    private firebase: FirebaseService,
    private router: Router
  ) {

    this.firebase.onAuthChange.subscribe(authenticated => {

      this.authenticated = authenticated;
      this.noAuth = false;

      if ( ! this.authenticated ) this.router.navigate(['auth']);
      else this.router.navigate(['/']);

    });

  }

}
