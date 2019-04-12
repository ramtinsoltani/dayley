import { Injectable } from '@angular/core';
import cert from '@app/config/firebase.cert';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { Observable, Observer } from 'rxjs';
import { Counter } from '@app/model/counter';
import { Todo } from '@app/model/todo';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  public onAuthChange: Observable<boolean> = Observable.create((observer: Observer<boolean>) => {

    firebase.auth().onAuthStateChanged(user => {

      observer.next(!! user);

    });

  });

  constructor() {

    firebase.initializeApp(cert);

  }

  public signup(email: string, password: string): Promise<void> {

    return new Promise((resolve, reject) => {

      firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => resolve())
      .catch(reject);

    });

  }

  public login(email: string, password: string): Promise<void> {

    return new Promise((resolve, reject) => {

      firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => resolve())
      .catch(reject);

    });

  }

  public sendPasswordResetEmail(email: string): Promise<void> {

    return firebase.auth().sendPasswordResetEmail(email);

  }

  public logout(): Promise<void> {

    if ( ! firebase.auth().currentUser ) return Promise.resolve();

    return firebase.auth().signOut();

  }

  public getCounters(): Promise<Counter[]> {

    if ( ! firebase.auth().currentUser ) return Promise.reject(new Error('User not logged in!'));

    return new Promise((resolve, reject) => {

      firebase.database().ref(`counters/${firebase.auth().currentUser.uid}`).once('value')
      .then(snapshot => {

        const counters: Counter[] = [];

        for ( const id in snapshot.val() ) {

          counters.push(_.merge(snapshot.val()[id], { id: id }));

        }

        resolve(_.orderBy(counters, ['lastUpdate'], ['desc']));

      })
      .catch(reject);

    });

  }

  public getTodos(): Promise<Todo[]> {

    if ( ! firebase.auth().currentUser ) return Promise.reject(new Error('User not logged in!'));

    return new Promise((resolve, reject) => {

      firebase.database().ref(`todos/${firebase.auth().currentUser.uid}`).once('value')
      .then(snapshot => {

        const todos: Todo[] = [];

        for ( const id in snapshot.val() ) {

          todos.push(_.merge(snapshot.val()[id], { id: id, items: snapshot.val()[id].items || [] }));

        }

        resolve(_.orderBy(todos, ['lastUpdate'], ['desc']));

      })
      .catch(reject);

    });

  }

  public getStats(): Promise<any> {

    if ( ! firebase.auth().currentUser ) return Promise.reject(new Error('User not logged in!'));

    return new Promise((resolve, reject) => {

      firebase.database().ref(`stats${firebase.auth().currentUser.uid}`).once('value')
      .then(snapshot => {

        resolve(snapshot.val());

      })
      .catch(reject);

    });

  }

  public updateCounter(counter: Counter): Promise<void> {

    if ( ! firebase.auth().currentUser ) return Promise.reject(new Error('User not logged in!'));

    return firebase.database().ref(`counters/${firebase.auth().currentUser.uid}/${counter.id}`).update(_.merge(counter, { id: null }));

  }

  public newCounter(counter: Counter): Promise<Counter> {

    if ( ! firebase.auth().currentUser ) return Promise.reject(new Error('User not logged in!'));

    return new Promise((resolve, reject) => {

      firebase.database().ref(`counters/${firebase.auth().currentUser.uid}`).push(_.merge(counter, { id: null }))
      .then(reference => {

        counter.id = reference.key;
        resolve(counter);

      })
      .catch(reject);

    });

  }

  public deleteCounter(id: string): Promise<void> {

    if ( ! firebase.auth().currentUser ) return Promise.reject(new Error('User not logged in!'));

    return firebase.database().ref(`counters/${firebase.auth().currentUser.uid}/${id}`).set(null);

  }

  public updateTodo(todo: Todo): Promise<void> {

    if ( ! firebase.auth().currentUser ) return Promise.reject(new Error('User not logged in!'));

    return firebase.database().ref(`todos/${firebase.auth().currentUser.uid}/${todo.id}`).update(_.merge(todo, { id: null }));

  }

  public newTodo(todo: Todo): Promise<Todo> {

    if ( ! firebase.auth().currentUser ) return Promise.reject(new Error('User not logged in!'));

    return new Promise((resolve, reject) => {

      firebase.database().ref(`todos/${firebase.auth().currentUser.uid}`).push(_.merge(todo, { id: null }))
      .then(reference => {

        todo.id = reference.key;
        resolve(todo);

      })
      .catch(reject);

    });

  }

  public deleteTodo(id: string): Promise<void> {

    if ( ! firebase.auth().currentUser ) return Promise.reject(new Error('User not logged in!'));

    return firebase.database().ref(`todos/${firebase.auth().currentUser.uid}/${id}`).set(null);

  }

  public updateStats(stats: any): Promise<void> {

    if ( ! firebase.auth().currentUser ) return Promise.reject(new Error('User not logged in!'));

    return firebase.database().ref(`stats/${firebase.auth().currentUser.uid}`).update(stats);

  }

}
