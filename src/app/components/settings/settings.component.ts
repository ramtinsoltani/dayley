import { Component } from '@angular/core';
import { FirebaseService } from '@app/services';
import { version } from '../../../../package.json';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  public appVersion: string = version;

  constructor(
    private firebase: FirebaseService
  ) { }

  public logout(): void {

    this.firebase.logout();

  }

}
