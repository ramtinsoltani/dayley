import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '@app/services';
import { DeviceDetectorService } from 'ngx-device-detector';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public noAuth: boolean = true;
  public authenticated: boolean = false;
  public desktop: boolean = false;

  constructor(
    private firebase: FirebaseService,
    private router: Router,
    private detector: DeviceDetectorService,
    private sw: SwUpdate
  ) {

    // Enable :active on touch (due to CSS property -webkit-tap-highlight-color)
    document.addEventListener("touchstart", function(){}, true);

    this.desktop = this.detector.isDesktop();

    if ( this.desktop ) return;

    this.firebase.onAuthChange.subscribe(authenticated => {

      this.authenticated = authenticated;
      this.noAuth = false;

      if ( ! this.authenticated ) this.router.navigate(['auth']);
      else this.router.navigate(['/']);

    });

    if ( this.sw.isEnabled ) this.sw.checkForUpdate();

  }

}
