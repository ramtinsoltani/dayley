import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppService } from '@app/services';
import { Counter } from '@app/model/counter';
import { LimitReset } from '@app/model/common';
import { Subscription } from 'rxjs';
import _ from 'lodash';

@Component({
  selector: 'app-counters',
  templateUrl: './counters.component.html',
  styleUrls: ['./counters.component.scss']
})
export class CountersComponent implements OnInit, OnDestroy {

  @ViewChild('ef')
  public editForm: NgForm;

  public countersState = CountersState;
  public state: CountersState = CountersState.ListView;
  public counters: Counter[] = [];
  public currentCounter: number = -1;
  public title: string = 'counters';
  public iconSelection: boolean = false;

  private sub: Subscription;

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

    this.sub = this.app.onCounterReset.subscribe(() => {

      this.app.getCounters()
      .then(counters => {

        let currentId = this.currentCounter > -1 ? this.counters[this.currentCounter].id : undefined;

        this.counters = counters;

        if ( this.currentCounter > -1 ) this.currentCounter = this.app.getCounterIndex(currentId);

      })
      .catch(console.error);

    });

  }

  ngOnDestroy() {

    if ( this.sub && ! this.sub.closed ) this.sub.unsubscribe();

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

      let newIndex: number;

      this.app.newCounter(
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
      this.currentCounter = -1;
      this.showListView();

    })
    .catch(console.error);

  }

  public openIconSelector(): void {

    this.iconSelection = true;

  }

  public selectIcon(icon: string): void {

    this.iconSelection = false;
    this.editForm.value.icon = icon;
    this.editForm.setValue(_.merge(this.editForm.value, { icon: icon }));

  }

  public incrementCurrentCounter(): void {

    let newIndex: number;

    this.app.updateCounterValue(this.currentCounter, this.counters[this.currentCounter].value + 1)
    .then(index => {

      newIndex = index;

      return this.app.getCounters();

    })
    .then(counters => {

      this.counters = counters;
      this.currentCounter = newIndex;

    })
    .catch(console.error);

  }

  public decrementCurrentCounter(): void {

    if ( ! this.counters[this.currentCounter].value ) return;

    let newIndex: number;

    this.app.updateCounterValue(this.currentCounter, this.counters[this.currentCounter].value - 1)
    .then(index => {

      newIndex = index;

      return this.app.getCounters();

    })
    .then(counters => {

      this.counters = counters;
      this.currentCounter = newIndex;

    })
    .catch(console.error);

  }

  public resetLimitOnCurrentCounter(): void {

    let newIndex: number;

    this.app.resetCounter(this.counters[this.currentCounter].id)
    .then(index => {

      newIndex = index;

      return this.app.getCounters();

    })
    .then(counters => {

      this.counters = counters;
      this.currentCounter = newIndex;

    })
    .catch(console.error);

  }

  public getUntilText(): string {

    const counter = this.counters[this.currentCounter];
    const date = new Date();

    if ( counter.resets === LimitReset.Manual ) return '';
    else if ( counter.resets === LimitReset.Daily ) {

      const nextDay = new Date(date.getTime() + 86400000);

      return ` until ${nextDay.getMonth() + 1 < 10 ? '0' : ''}${nextDay.getMonth() + 1}/${nextDay.getDate() < 10 ? '0' : ''}${nextDay.getDate()}/${nextDay.getFullYear()}`;

    }
    else if ( counter.resets === LimitReset.Weekly ) {

      let day = date.getDay();
      let daysUntilNextWeek: number;

      // Sunday
      if ( day === 0 ) daysUntilNextWeek = 1;
      // Monday
      else if ( day === 1 ) daysUntilNextWeek = 7;
      // Tuesday - Saturday
      else daysUntilNextWeek = 8 - day;

      const nextMonday = new Date((daysUntilNextWeek * 86400000) + date.getTime());

      return ` until ${nextMonday.getMonth() + 1 < 10 ? '0' : ''}${nextMonday.getMonth() + 1}/${nextMonday.getDate() < 10 ? '0' : ''}${nextMonday.getDate()}/${nextMonday.getFullYear()}`;

    }
    else if ( counter.resets === LimitReset.Monthly ) {

      let year = date.getFullYear();
      let month: any = date.getMonth() + 2;

      if ( month > 12 ) {

        month = 0;
        year++;

      }

      if ( month < 10 ) month = '0' + month;

      return ` until ${month}/01/${year}`;

    }

  }

}

enum CountersState {

  ListView,
  DetailView,
  EditView,
  NewView,
  Loading

}
