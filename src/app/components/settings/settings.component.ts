import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService, AppService } from '@app/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  private sub: Subscription;

  public appVersion: string;
  public availableVersion: string;

  constructor(
    private firebase: FirebaseService,
    private app: AppService
  ) { }

  ngOnInit() {

    this.appVersion = this.app.appVersion;

    this.sub = this.app.updateAvailable.subscribe(version => {

      this.availableVersion = version;

    });

  }

  ngOnDestroy() {

    if ( this.sub && ! this.sub.closed ) this.sub.unsubscribe();

  }

  public logout(): void {

    this.firebase.logout();

  }

  public refresh(): void {

    window.location.reload(true);

  }

}
