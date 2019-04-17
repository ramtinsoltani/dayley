import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppService } from '@app/services';
import { Todo } from '@app/model/todo';
import { Subscription } from 'rxjs';
import _ from 'lodash';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss']
})
export class TodosComponent implements OnInit, OnDestroy {

  @ViewChild('ef')
  public editForm: NgForm;

  public todosState = TodosState;
  public state: TodosState = TodosState.ListView;
  public todos: Todo[] = [];
  public currentTodo: number = -1;
  public title: string = 'todos';
  public iconSelection: boolean = false;
  public itemNameInput: boolean = false;
  public currentItem: number = -1;
  public currentRevealed: number = -1;

  private sub: Subscription;

  constructor(
    private app: AppService
  ) { }

  ngOnInit() {

    this.state = TodosState.Loading;

    this.app.getTodos()
    .then(todos => {

      this.todos = todos;

    })
    .catch(console.error)
    .finally(() => {

      this.state = TodosState.ListView;

    });

    this.sub = this.app.onTodoReset.subscribe(() => {

      this.app.getTodos()
      .then(todos => {

        let currentId = this.currentTodo > -1 ? this.todos[this.currentTodo].id : undefined;

        this.todos = todos;

        if ( this.currentTodo > -1 ) this.currentTodo = this.app.getTodoIndex(currentId);

      })
      .catch(console.error);

    });

  }

  ngOnDestroy() {

    if ( this.sub && ! this.sub.closed ) this.sub.unsubscribe();

  }

  public showListView(): void {

    this.title = 'todos';
    this.state = TodosState.ListView;

  }

  public showNewView(): void {

    this.title = 'new todo';
    this.state = TodosState.NewView;

  }

  public showEditView(): void {

    this.state = TodosState.EditView;

  }

  public showDetailView(index: number): void {

    this.currentTodo = index;
    this.title = this.todos[index].name;
    this.state = TodosState.DetailView;

  }

  public showNewItemModal(): void {

    this.itemNameInput = true;

  }

  public openIconSelector(): void {

    this.iconSelection = true;

  }

  public selectIcon(icon: string): void {

    this.iconSelection = false;
    this.editForm.value.icon = icon;
    this.editForm.setValue(_.merge(this.editForm.value, { icon: icon }));

  }

  public deleteTodo(): void {

    this.app.deleteTodo(this.currentTodo)
    .then(() => {

      return this.app.getTodos();

    })
    .then(todos => {

      this.todos = todos;
      this.currentTodo = -1;
      this.showListView();

    })
    .catch(console.error);

  }

  public updateTodo(form: NgForm): void {

    if ( form.invalid ) return;

    if ( this.state === TodosState.NewView ) {

      let newIndex: number;

      this.app.newTodo(
        form.value.name.trim(),
        form.value.resets,
        form.value.icon
      )
      .then(index => {

        newIndex = index;

        return this.app.getTodos();

      })
      .then(todos => {

        this.todos = todos;
        this.currentTodo = newIndex;
        this.showDetailView(this.currentTodo);

      })
      .catch(console.error);

    }
    else {

      let newIndex: number;

      this.app.updateTodo(
        this.currentTodo,
        form.value.name.trim(),
        form.value.resets,
        [],
        form.value.icon
      )
      .then(index => {

        newIndex = index;

        return this.app.getTodos();

      })
      .then(todos => {

        this.todos = todos;
        this.currentTodo = newIndex;
        this.showDetailView(this.currentTodo);

      })
      .catch(console.error);

    }

  }

  public closeItemModal(): void {

    this.itemNameInput = false;
    this.currentItem = -1;

  }

  public toggleTodoItemOptions(event: MouseEvent, index: number): void {

    event.stopPropagation();

    if ( this.currentRevealed === index ) this.currentRevealed = -1;
    else this.currentRevealed = index;

  }

  public editTodoItem(event: MouseEvent, index: number): void {

    event.stopPropagation();

    this.currentRevealed = -1;
    this.currentItem = index;
    this.showNewItemModal();

  }

  public deleteTodoItem(event: MouseEvent, index: number): void {

    event.stopPropagation();

    this.currentRevealed = -1;

    let newIndex: number;
    const todo: Todo = this.todos[this.currentTodo];

    todo.items.splice(index, 1);

    this.app.updateTodoItems(this.currentTodo, todo.items)
    .then(index => {

      newIndex = index;

      return this.app.getTodos();

    })
    .then(todos => {

      this.todos = todos;
      this.currentTodo = newIndex;

    })
    .catch(console.error);

  }

  public toggleTodoItem(index: number): void {

    let newIndex: number;
    const todo: Todo = this.todos[this.currentTodo];

    todo.items[index].checked = ! todo.items[index].checked;

    this.app.updateTodo(
      this.currentTodo,
      todo.name,
      todo.resets,
      todo.items,
      todo.icon
    )
    .then(index => {

      newIndex = index;

      return this.app.getTodos();

    })
    .then(todos => {

      this.todos = todos;
      this.currentTodo = newIndex;

    })
    .catch(console.error);

  }

  public updateTodoItem(value: string): void {

    this.itemNameInput = false;

    if ( this.currentItem > -1 ) {

      this.currentRevealed = -1;

      let newIndex: number;
      const items = this.todos[this.currentTodo].items;

      items[this.currentItem].value = value;

      this.app.updateTodoItems(this.currentTodo, items)
      .then(index => {

        newIndex = index;

        return this.app.getTodos();

      })
      .then(todos => {

        this.todos = todos;
        this.currentTodo = newIndex;

      })
      .catch(console.error)
      .finally(() => {

        this.currentItem = -1;

      });

    }
    else {

      let newIndex: number;
      const todo: Todo = this.todos[this.currentTodo];

      todo.items.push({
        checked: false,
        value: value
      });

      this.app.updateTodo(
        this.currentTodo,
        todo.name,
        todo.resets,
        todo.items,
        todo.icon
      )
      .then(index => {

        newIndex = index;

        return this.app.getTodos();

      })
      .then(todos => {

        this.todos = todos;
        this.currentTodo = newIndex;

      })
      .catch(console.error);

    }

  }

  public areAllChecked(index: number): boolean {

    return ! _.filter(this.todos[index].items, item => ! item.checked).length;

  }

  public resetTodo(): void {

    let newIndex: number;

    this.app.resetTodo(this.todos[this.currentTodo].id)
    .then(index => {

      newIndex = index;

      return this.app.getTodos();

    })
    .then(todos => {

      this.todos = todos;
      this.currentTodo = newIndex;

    })
    .catch(console.error);

  }

}

enum TodosState {

  ListView,
  DetailView,
  EditView,
  NewView,
  Loading

}
