import { Component, OnInit } from '@angular/core';
import { AppService } from '@app/services';
import { Counter } from '@app/model/counter';

@Component({
  selector: 'app-counters',
  templateUrl: './counters.component.html',
  styleUrls: ['./counters.component.scss']
})
export class CountersComponent implements OnInit {

  public countersState = CountersState;
  public state: CountersState = CountersState.ListView;
  public counters: Counter[] = [];

  constructor(
    private app: AppService
  ) { }

  ngOnInit() {

    this.state = CountersState.Loading;

    this.app.getCounters()
    .then(counters => {

      this.counters = counters;
      console.log('GOT COUNTERS', counters)

    })
    .catch(console.error)
    .finally(() => {

      this.state = CountersState.ListView;
console.log(this.state)
    });

  }

  public showNewView(): void {

    this.state = CountersState.NewView;

  }

}

enum CountersState {

  ListView,
  DetailView,
  EditView,
  NewView,
  Loading

}
