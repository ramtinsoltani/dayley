import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppService } from '@app/services';
import { Goal } from '@app/model/goal';
import { Subscription } from 'rxjs';
import _ from 'lodash';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit, OnDestroy {

  @ViewChild('ef')
  public editForm: NgForm;

  public goalsState = GoalsState;
  public state: GoalsState = GoalsState.ListView;
  public goals: Goal[] = [];
  public currentGoal: number = -1;
  public title: string = 'goals';
  public iconSelection: boolean = false;
  public itemInput: boolean = false;
  public currentItem: number = -1;
  public currentRevealed: number = -1;

  private sub: Subscription;

  constructor(
    private app: AppService
  ) { }

  ngOnInit() {

    this.state = GoalsState.Loading;

    this.app.getGoals()
    .then(goals => {

      this.goals = goals;

    })
    .catch(console.error)
    .finally(() => {

      this.state = GoalsState.ListView;

    });

    this.sub = this.app.onGoalReset.subscribe(() => {

      this.app.getGoals()
      .then(goals => {

        let currentId = this.currentGoal > -1 ? this.goals[this.currentGoal].id : undefined;

        this.goals = goals;

        if ( this.currentGoal > -1 ) this.currentGoal = this.app.getGoalIndex(currentId);

      })
      .catch(console.error);

    });

  }

  ngOnDestroy() {

    if ( this.sub && ! this.sub.closed ) this.sub.unsubscribe();

  }

  public showListView(): void {

    this.title = 'goals';
    this.state = GoalsState.ListView;

  }

  public showNewView(): void {

    this.title = 'new goal';
    this.state = GoalsState.NewView;

  }

  public showEditView(): void {

    this.state = GoalsState.EditView;

  }

  public showDetailView(index: number): void {

    this.currentGoal = index;
    this.title = this.goals[index].name;
    this.state = GoalsState.DetailView;

  }

  public showNewItemModal(): void {

    this.itemInput = true;

  }

  public openIconSelector(): void {

    this.iconSelection = true;

  }

  public selectIcon(icon: string): void {

    this.iconSelection = false;
    this.editForm.value.icon = icon;
    this.editForm.setValue(_.merge(this.editForm.value, { icon: icon }));

  }

  public deleteGoal(): void {

    this.app.deleteGoal(this.currentGoal)
    .then(() => {

      return this.app.getGoals();

    })
    .then(goals => {

      this.goals = goals;
      this.currentGoal = -1;
      this.showListView();

    })
    .catch(console.error);

  }

  public updateGoal(form: NgForm): void {

    if ( form.invalid ) return;

    if ( this.state === GoalsState.NewView ) {

      let newIndex: number;

      this.app.newGoal(
        form.value.name.trim(),
        form.value.resets,
        form.value.icon,
        form.value.target
      )
      .then(index => {

        newIndex = index;

        return this.app.getGoals();

      })
      .then(goals => {

        this.goals = goals;
        this.currentGoal = newIndex;
        this.showDetailView(this.currentGoal);

      })
      .catch(console.error);

    }
    else {

      let newIndex: number;

      this.app.updateGoal(
        this.currentGoal,
        form.value.name.trim(),
        form.value.resets,
        [],
        form.value.icon,
        form.value.target
      )
      .then(index => {

        newIndex = index;

        return this.app.getGoals();

      })
      .then(goals => {

        this.goals = goals;
        this.currentGoal = newIndex;
        this.showDetailView(this.currentGoal);

      })
      .catch(console.error);

    }

  }

  public closeItemModal(): void {

    this.itemInput = false;
    this.currentItem = -1;

  }

  public toggleGoalItemOptions(event: MouseEvent, index: number): void {

    event.stopPropagation();

    if ( this.currentRevealed === index ) this.currentRevealed = -1;
    else this.currentRevealed = index;

  }

  public editGoalItem(event: MouseEvent, index: number): void {

    event.stopPropagation();

    this.currentRevealed = -1;
    this.currentItem = index;
    this.showNewItemModal();

  }

  public deleteGoalItem(event: MouseEvent, index: number): void {

    event.stopPropagation();

    this.currentRevealed = -1;

    let newIndex: number;
    const goal: Goal = this.goals[this.currentGoal];

    goal.items.splice(index, 1);

    this.app.updateGoalItems(this.currentGoal, goal.items)
    .then(index => {

      newIndex = index;

      return this.app.getGoals();

    })
    .then(goals => {

      this.goals = goals;
      this.currentGoal = newIndex;

    })
    .catch(console.error);

  }

  public updateGoalItem(value: any): void {

    this.itemInput = false;

    if ( this.currentItem > -1 ) {

      this.currentRevealed = -1;

      let newIndex: number;
      const items = this.goals[this.currentGoal].items;

      items[this.currentItem].value = value.input * 1;
      items[this.currentItem].memo = value.secondaryInput || null;

      this.app.updateGoalItems(this.currentGoal, items)
      .then(index => {

        newIndex = index;

        return this.app.getGoals();

      })
      .then(goals => {

        this.goals = goals;
        this.currentGoal = newIndex;

      })
      .catch(console.error)
      .finally(() => {

        this.currentItem = -1;

      });

    }
    else {

      let newIndex: number;
      const goal: Goal = this.goals[this.currentGoal];

      goal.items.push({
        value: value.input * 1,
        memo: value.secondaryInput || null
      });

      this.app.updateGoal(
        this.currentGoal,
        goal.name,
        goal.resets,
        goal.items,
        goal.icon,
        goal.target
      )
      .then(index => {

        newIndex = index;

        return this.app.getGoals();

      })
      .then(goals => {

        this.goals = goals;
        this.currentGoal = newIndex;

      })
      .catch(console.error);

    }

  }

  public resetGoal(): void {

    let newIndex: number;

    this.app.resetGoal(this.goals[this.currentGoal].id)
    .then(index => {

      newIndex = index;

      return this.app.getGoals();

    })
    .then(goals => {

      this.goals = goals;
      this.currentGoal = newIndex;

    })
    .catch(console.error);

  }

  public calculateTotal(index: number): number {

    if ( ! this.goals[index].items.length ) return 0;

    return _.reduce(this.goals[index].items, (a, b) => {
      return { value: a.value + b.value };
    }).value;

  }

  public calculatePercentage(index: number): string {

    if ( ! this.goals[index].items.length ) return '0%';

    return `${Math.min((this.calculateTotal(index) * 100) / this.goals[index].target, 100)}%`;

  }

}

enum GoalsState {

  ListView,
  DetailView,
  EditView,
  NewView,
  Loading

}
