import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { FirebaseService } from './firebase.service';
import { Counter } from '@app/model/counter';
import { Todo, TodoItem } from '@app/model/todo';
import { Goal, GoalItem } from '@app/model/goal';
import { LimitReset } from '@app/model/common';
import { Subject, BehaviorSubject } from 'rxjs';
import moment from 'moment';
import _ from 'lodash';
import { version } from '../../../package.json';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private todos: Todo[] = [];
  private counters: Counter[] = [];
  private goals: Goal[] = [];
  private stats: any = {};
  private mustFetchCounters: boolean = true;
  private mustFetchTodos: boolean = true;
  private mustFetchStats: boolean = true;
  private mustFetchGoals: boolean = true;

  public onCounterReset: Subject<void> = new Subject<void>();
  public onTodoReset: Subject<void> = new Subject<void>();
  public onGoalReset: Subject<void> = new Subject<void>();
  public readonly appVersion: string = version;
  public latestAppVersion: string = this.appVersion;
  public updateAvailable: BehaviorSubject<string> = new BehaviorSubject<string>(this.latestAppVersion);

  constructor(
    private firebase: FirebaseService,
    private sw: SwUpdate
  ) {

    this.firebase.onAuthChange.subscribe(authenticated => {

      if ( ! authenticated ) {

        this.todos = [];
        this.counters = [];
        this.goals = [];
        this.stats = {};
        this.mustFetchCounters = false;
        this.mustFetchTodos = false;
        this.mustFetchStats = false;
        this.mustFetchGoals = false;

        return;

      }

      this.mustFetchCounters = true;
      this.mustFetchTodos = true;
      this.mustFetchStats = true;
      this.mustFetchGoals = true;

    });

    // Listen for broadcasting app versions
    this.firebase.onVersionBroadcasted.subscribe(latestVersion => {

      if ( version !== latestVersion ) {

        if ( this.sw.isEnabled ) this.sw.checkForUpdate();

        this.latestAppVersion = latestVersion;
        this.updateAvailable.next(latestVersion);

      }

    });

    // Check counters and todos for reset
    setInterval(() => {

      for ( const counter of this.counters ) {

        if ( counter.resets === LimitReset.Manual ) continue;

        const lastReset = moment(counter.lastReset);
        const now = moment();

        if ( (counter.resets === LimitReset.Daily && now.diff(lastReset, 'days') > 0) ||
        (counter.resets === LimitReset.Monthly && now.diff(lastReset, 'months') > 0) ||
        (counter.resets === LimitReset.Weekly && now.diff(lastReset, 'weeks')) ) {

          this.resetCounter(counter.id)
          .then(() => {

            this.onCounterReset.next();

          })
          .catch(console.error);

        }

      }

      for ( const todo of this.todos ) {

        if ( todo.resets === LimitReset.Manual ) continue;

        const lastReset = moment(todo.lastReset);
        const now = moment();

        if ( (todo.resets === LimitReset.Daily && now.diff(lastReset, 'days') > 0) ||
        (todo.resets === LimitReset.Monthly && now.diff(lastReset, 'months') > 0) ||
        (todo.resets === LimitReset.Weekly && now.diff(lastReset, 'weeks')) ) {

          this.resetTodo(todo.id)
          .then(() => {

            this.onTodoReset.next();

          })
          .catch(console.error);

        }

      }

      for ( const goal of this.goals ) {

        if ( goal.resets === LimitReset.Manual ) continue;

        const lastReset = moment(goal.lastReset);
        const now = moment();

        if ( (goal.resets === LimitReset.Daily && now.diff(lastReset, 'days') > 0) ||
        (goal.resets === LimitReset.Monthly && now.diff(lastReset, 'months') > 0) ||
        (goal.resets === LimitReset.Weekly && now.diff(lastReset, 'weeks')) ) {

          this.resetGoal(goal.id)
          .then(() => {

            this.onGoalReset.next();

          })
          .catch(console.error);

        }

      }

    }, 1000);

  }

  public getTodos(): Promise<Todo[]> {

    return new Promise((resolve, reject) => {

      if ( ! this.mustFetchTodos ) return resolve(_.cloneDeep(this.todos));

      this.fetchTodos()
      .then(todos => {

        this.mustFetchTodos = false;
        resolve(todos);

      })
      .catch(reject);

    });

  }

  public getCounters(): Promise<Counter[]> {

    return new Promise((resolve, reject) => {

      if ( ! this.mustFetchCounters ) return resolve(_.cloneDeep(this.counters));

      this.fetchCounters()
      .then(counters => {

        this.mustFetchCounters = false;
        resolve(counters);

      })
      .catch(reject);

    });

  }

  public getGoals(): Promise<Goal[]> {

    return new Promise((resolve, reject) => {

      if ( ! this.mustFetchGoals ) return resolve(_.cloneDeep(this.goals));

      this.fetchGoals()
      .then(goals => {

        this.mustFetchGoals = false;
        resolve(goals);

      })
      .catch(reject);

    });

  }

  public getStats(): Promise<any> {

    return new Promise((resolve, reject) => {

      if ( ! this.mustFetchStats ) return resolve(_.cloneDeep(this.stats));

      this.fetchStats()
      .then(stats => {

        this.mustFetchStats = false;
        resolve(stats);

      })
      .catch(reject);

    });

  }

  public newTodo(
    name: string,
    resets: LimitReset,
    icon: string
  ): Promise<number> {

    return new Promise((resolve, reject) => {

      this.firebase.newTodo({
        id: null,
        name: name,
        resets: resets,
        icon: icon,
        items: [],
        lastReset: Date.now(),
        lastUpdate: Date.now()
      })
      .then(todo => {

        this.todos.push(todo);
        this.todos = _.orderBy(this.todos, ['lastUpdate'], ['desc']);

        resolve(this.getTodoIndex(todo.id));

      })
      .catch(reject);

    });

  }

  public newCounter(
    name: string,
    limit: number,
    resets: LimitReset,
    icon: string
  ): Promise<number> {

    return new Promise((resolve, reject) => {

      this.firebase.newCounter({
        id: null,
        name: name,
        limit: limit,
        resets: resets,
        icon: icon,
        value: 0,
        lastReset: Date.now(),
        lastUpdate: Date.now()
      })
      .then(counter => {

        this.counters.push(counter);
        this.counters = _.orderBy(this.counters, ['lastUpdate'], ['desc']);

        resolve(this.getCounterIndex(counter.id));

      })
      .catch(reject);

    });

  }

  public newGoal(
    name: string,
    resets: LimitReset,
    icon: string,
    target: number
  ): Promise<number> {

    return new Promise((resolve, reject) => {

      this.firebase.newGoal({
        id: null,
        name: name,
        resets: resets,
        icon: icon,
        items: [],
        lastReset: Date.now(),
        lastUpdate: Date.now(),
        target: target
      })
      .then(goal => {

        this.goals.push(goal);
        this.goals = _.orderBy(this.goals, ['lastUpdate'], ['desc']);

        resolve(this.getGoalIndex(goal.id));

      })
      .catch(reject);

    });

  }

  public deleteTodo(index: number): Promise<void> {

    if ( index < 0 || index > this.todos.length - 1 ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      this.firebase.deleteTodo(this.todos[index].id)
      .then(() => {

        this.todos.splice(index, 1);
        resolve();

      })
      .catch(reject);

    });

  }

  public deleteCounter(index: number): Promise<void> {

    if ( index < 0 || index > this.counters.length - 1 ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      this.firebase.deleteCounter(this.counters[index].id)
      .then(() => {

        this.counters.splice(index, 1);
        resolve();

      })
      .catch(reject);

    });

  }

  public deleteGoal(index: number): Promise<void> {

    if ( index < 0 || index > this.goals.length - 1 ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      this.firebase.deleteGoal(this.goals[index].id)
      .then(() => {

        this.goals.splice(index, 1);
        resolve();

      })
      .catch(reject);

    });

  }

  public updateTodo(
    index: number,
    name: string,
    resets: LimitReset,
    items: TodoItem[],
    icon: string
  ): Promise<number> {

    if ( index < 0 || index > this.todos.length - 1 ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      const newTodo: Todo = _.merge(this.todos[index], {
        lastUpdate: Date.now(),
        name: name,
        resets: resets,
        items: items,
        icon: icon
      });

      this.firebase.updateTodo(newTodo)
      .then(() => {

        this.todos[index] = _.cloneDeep(newTodo);
        this.todos = _.orderBy(this.todos, ['lastUpdate'], ['desc']);

        resolve(this.getTodoIndex(newTodo.id));

      })
      .catch(reject);

    });

  }

  public updateTodoItems(index: number, items: TodoItem[]): Promise<number> {

    if ( index < 0 || index > this.todos.length - 1 ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      const lastUpdate = Date.now();

      this.firebase.setTodoItems(this.todos[index].id, items, lastUpdate)
      .then(() => {

        let id = this.todos[index].id;

        this.todos[index].items = _.cloneDeep(items);
        this.todos[index].lastUpdate = lastUpdate;
        this.todos = _.orderBy(this.todos, ['lastUpdate'], ['desc']);

        resolve(this.getTodoIndex(id));

      })
      .catch(reject);

    });

  }

  public updateGoal(
    index: number,
    name: string,
    resets: LimitReset,
    items: GoalItem[],
    icon: string,
    target: number
  ): Promise<number> {

    if ( index < 0 || index > this.goals.length - 1 ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      const newGoal: Goal = _.merge(this.goals[index], {
        lastUpdate: Date.now(),
        name: name,
        resets: resets,
        items: items,
        icon: icon,
        target: target
      });

      this.firebase.updateGoal(newGoal)
      .then(() => {

        this.goals[index] = _.cloneDeep(newGoal);
        this.goals = _.orderBy(this.goals, ['lastUpdate'], ['desc']);

        resolve(this.getGoalIndex(newGoal.id));

      })
      .catch(reject);

    });

  }

  public updateGoalItems(index: number, items: GoalItem[]): Promise<number> {

    if ( index < 0 || index > this.goals.length - 1 ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      const lastUpdate = Date.now();

      this.firebase.setGoalItems(this.goals[index].id, items, lastUpdate)
      .then(() => {

        let id = this.goals[index].id;

        this.goals[index].items = _.cloneDeep(items);
        this.goals[index].lastUpdate = lastUpdate;
        this.goals = _.orderBy(this.goals, ['lastUpdate'], ['desc']);

        resolve(this.getGoalIndex(id));

      })
      .catch(reject);

    });

  }

  public updateCounter(index: number, name: string, limit: number, resets: LimitReset, icon: string): Promise<number> {

    if ( index < 0 || index > this.counters.length - 1 ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      const newCounter: Counter = _.merge(this.counters[index], {
        name: name,
        limit: limit,
        resets: resets,
        icon: icon,
        lastUpdate: Date.now()
      });

      this.firebase.updateCounter(newCounter)
      .then(() => {

        this.counters[index] = _.cloneDeep(newCounter);
        this.counters = _.orderBy(this.counters, ['lastUpdate'], ['desc']);

        resolve(this.getCounterIndex(newCounter.id));

      })
      .catch(reject);

    });

  }

  public updateCounterValue(index: number, value: number): Promise<number> {

    if ( index < 0 || index > this.counters.length - 1 ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      const newCounter: Counter = _.merge(this.counters[index], {
        value: value,
        lastUpdate: Date.now()
      });

      this.firebase.updateCounter(newCounter)
      .then(() => {

        this.counters[index] = _.cloneDeep(newCounter);
        this.counters = _.orderBy(this.counters, ['lastUpdate'], ['desc']);

        resolve(this.getCounterIndex(newCounter.id));

      })
      .catch(reject);

    });

  }

  public resetCounter(id: string): Promise<number> {

    let index = this.getCounterIndex(id);

    if ( index < 0 || index > this.counters.length - 1 ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      const newCounter: Counter = _.merge(this.counters[index], {
        lastReset: Date.now(),
        lastUpdate: Date.now(),
        value: 0
      });

      this.firebase.updateCounter(newCounter)
      .then(() => {

        // Recalculate the index since simultaneous auto resets can reorder the counters, making the index invalid
        index = this.getCounterIndex(id);

        this.counters[index] = _.cloneDeep(newCounter);
        this.counters = _.orderBy(this.counters, ['lastUpdate'], ['desc']);

        resolve(index);

      })
      .catch(reject);

    });

  }

  public resetTodo(id: string): Promise<number> {

    let index = this.getTodoIndex(id);

    if ( index < 0 || index > this.todos.length ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      const newTodo: Todo = _.merge(this.todos[index], {
        items: _.map(this.todos[index].items, item => {
          item.checked = false;
          return item;
        })
      });

      this.firebase.updateTodo(newTodo)
      .then(() => {

        // Recalculate the index since simultaneous auto resets can reorder the todos, making the index invalid
        index = this.getTodoIndex(id);

        this.todos[index] = _.cloneDeep(newTodo);
        this.todos = _.orderBy(this.todos, ['lastUpdate'], ['desc']);

        resolve(index);

      })
      .catch(reject);

    });

  }

  public resetGoal(id: string): Promise<number> {

    let index = this.getGoalIndex(id);

    if ( index < 0 || index > this.goals.length ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      const newGoal: Goal = _.merge(this.goals[index], {
        lastUpdate: Date.now(),
        lastReset: Date.now()
      });

      newGoal.items = [];

      this.firebase.setGoalItems(newGoal.id, newGoal.items, newGoal.lastUpdate)
      .then(() => {

        // Recalculate the index since simultaneous auto resets can reorder the goals, making the index invalid
        index = this.getGoalIndex(id);

        this.goals[index] = _.cloneDeep(newGoal);
        this.goals = _.orderBy(this.goals, ['lastUpdate'], ['desc']);

        resolve(index);

      })
      .catch(reject);

    });

  }

  public updateStats(stats: any): Promise<void> {

    return this.firebase.updateStats(stats);

  }

  public getErrorMessage(code: string): string {

    return {
      'auth/user-not-found': 'Account not found!'
    }[code] || 'An unknown error has occurred!';

  }

  public getCounterIndex(id: string): number {

    return _.findIndex(this.counters, { id: id });

  }

  public getTodoIndex(id: string): number {

    return _.findIndex(this.todos, { id: id });

  }

  public getGoalIndex(id: string): number {

    return _.findIndex(this.goals, { id: id });

  }

  private fetchTodos(): Promise<Todo[]> {

    return new Promise((resolve, reject) => {

      this.firebase.getTodos()
      .then(todos => {

        this.todos = todos;
        resolve(_.cloneDeep(this.todos));

      })
      .catch(reject);

    });

  }

  private fetchCounters(): Promise<Counter[]> {

    return new Promise((resolve, reject) => {

      this.firebase.getCounters()
      .then(counters => {

        this.counters = counters;
        resolve(_.cloneDeep(this.counters));

      })
      .catch(reject);

    });

  }

  private fetchGoals(): Promise<Goal[]> {

    return new Promise((resolve, reject) => {

      this.firebase.getGoals()
      .then(goals => {

        this.goals = goals;
        resolve(_.cloneDeep(this.goals));

      })
      .catch(reject);

    });

  }

  private fetchStats(): Promise<any> {

    return new Promise((resolve, reject) => {

      this.firebase.getStats()
      .then(stats => {

        this.stats = stats;
        resolve(_.cloneDeep(this.stats));

      })
      .catch(reject);

    });

  }

}
