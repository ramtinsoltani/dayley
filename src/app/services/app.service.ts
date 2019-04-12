import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Counter } from '@app/model/counter';
import { Todo } from '@app/model/todo';
import { LimitReset } from '@app/model/common';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private todos: Todo[] = [];
  private counters: Counter[] = [];
  private stats: any = {};
  private mustFetchCounters: boolean = true;
  private mustFetchTodos: boolean = true;
  private mustFetchStats: boolean = true;

  constructor(
    private firebase: FirebaseService
  ) {

    this.firebase.onAuthChange.subscribe(authenticated => {

      if ( ! authenticated ) {

        this.todos = [];
        this.counters = [];
        this.stats = {};
        this.mustFetchCounters = false;
        this.mustFetchTodos = false;
        this.mustFetchStats = false;

        return;

      }

      this.mustFetchCounters = true;
      this.mustFetchTodos = true;
      this.mustFetchStats = true;

    });
const int = setInterval(() => {

  for ( const counter of this.counters ) {
    if ( counter.id === null ) {
      console.log(counter.name, 'has null id!');
clearInterval(int)
    }
  }

}, 10);
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
    icon: string,
  ): Promise<void> {

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

        resolve();

      })
      .catch(reject);

    });

  }

  public newCounter(
    name: string,
    limit: number,
    resets: LimitReset,
    icon: string
  ): Promise<void> {

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

        resolve();

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

  public updateTodo(index: number, todo: Todo): Promise<void> {

    if ( index < 0 || index > this.todos.length - 1 ) return Promise.reject(new Error('Index out of range!'));

    return new Promise((resolve, reject) => {

      this.firebase.updateTodo(_.merge(todo, { lastUpdate: Date.now() }))
      .then(() => {

        this.todos[index] = _.cloneDeep(todo);
        resolve();

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

        resolve(_.findIndex(this.counters, { id: newCounter.id }));

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
