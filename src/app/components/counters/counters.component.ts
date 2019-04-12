import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-counters',
  templateUrl: './counters.component.html',
  styleUrls: ['./counters.component.scss']
})
export class CountersComponent implements OnInit {

  public countersState = CountersState;
  public state: CountersState = CountersState.ListView;

  constructor() { }

  ngOnInit() {
  }

}

enum CountersState {

  ListView,
  DetailView,
  EditView

}
