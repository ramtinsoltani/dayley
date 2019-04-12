import { Component } from '@angular/core';
import { FirebaseService } from '@app/services';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  constructor(
    private firebase: FirebaseService
  ) { }

  public logout(): void {

    this.firebase.logout();

  }

}
