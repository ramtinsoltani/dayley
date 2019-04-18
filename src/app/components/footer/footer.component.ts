import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '@app/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {

  private sub: Subscription;

  public updateAvailable: boolean = false;

  constructor(
    private app: AppService
  ) { }

  ngOnInit() {

    this.sub = this.app.updateAvailable.subscribe(() => {

      this.updateAvailable = true;

    });

  }

  ngOnDestroy() {

    if ( this.sub && ! this.sub.closed ) this.sub.unsubscribe();

  }

}
