import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppService } from '@app/services';
import { Counter } from '@app/model/counter';
import _ from 'lodash';
import iconsList from '@app/config/icons';

@Component({
  selector: 'app-counters',
  templateUrl: './counters.component.html',
  styleUrls: ['./counters.component.scss']
})
export class CountersComponent implements OnInit {

  @ViewChild('ef')
  public editForm: NgForm;

  public countersState = CountersState;
  public state: CountersState = CountersState.ListView;
  public counters: Counter[] = [];
  public currentCounter: number = -1;
  public title: string = 'counters';
  public iconSelection: boolean = false;
  public icons: string[] = iconsList;

  constructor(
    private app: AppService
  ) { }

  ngOnInit() {

    this.state = CountersState.Loading;

    this.app.getCounters()
    .then(counters => {

      this.counters = counters;

    })
    .catch(console.error)
    .finally(() => {

      this.state = CountersState.ListView;

    });

  }

  public showListView(): void {

    this.title = 'counters';
    this.state = CountersState.ListView;

  }

  public showNewView(): void {

    this.title = 'new counter';
    this.state = CountersState.NewView;

  }

  public showEditView(): void {

    this.state = CountersState.EditView;

  }

  public showDetailView(index: number): void {

    this.currentCounter = index;
    this.title = this.counters[index].name;
    this.state = CountersState.DetailView;

  }

  public updateCounter(form: NgForm): void {

    if ( form.invalid ) return;

    if ( this.state === CountersState.NewView ) {

      this.app.newCounter(
        form.value.name.trim(),
        form.value.limit * 1,
        form.value.resets,
        form.value.icon
      )
      .then(() => {

        return this.app.getCounters();

      })
      .then(counters => {

        this.counters = counters;
        this.showDetailView(this.counters.length - 1);

      })
      .catch(console.error);

    }
    else {

      let newIndex: number;

      this.app.updateCounter(
        this.currentCounter,
        form.value.name.trim(),
        form.value.limit * 1,
        form.value.resets,
        form.value.icon
      )
      .then(index => {

        newIndex = index;

        return this.app.getCounters();

      })
      .then(counters => {

        this.counters = counters;
        this.currentCounter = newIndex;
        this.showDetailView(this.currentCounter);

      })
      .catch(console.error);

    }

  }

  public deleteCounter(): void {

    this.app.deleteCounter(this.currentCounter)
    .then(() => {

      return this.app.getCounters();

    })
    .then(counters => {

      this.counters = counters;
      this.currentCounter = null;
      this.showListView();

    })
    .catch(console.error);

  }

  public openIconSelector(): void {

    this.iconSelection = true;

  }

  public selectIcon(index: number): void {

    this.iconSelection = false;
    this.editForm.value.icon = this.icons[index];
    this.editForm.setValue(_.merge(this.editForm.value, { icon: this.icons[index] }));
    this.icons = iconsList;

  }

  public filterIcons(query: string): void {

    this.icons = _.filter(iconsList, (name: string) => {

      return (new RegExp(query.toLowerCase().trim(), 'ig')).test(name);

    });

  }

}

enum CountersState {

  ListView,
  DetailView,
  EditView,
  NewView,
  Loading

}
