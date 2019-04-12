import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input('title')
  public title: string = '';

  @Input('show-edit')
  public showEdit: boolean;

  @Input('show-back')
  public showBack: boolean;

  @Input('show-add')
  public showAdd: boolean;

  @Output('onback')
  public onBack: EventEmitter<void> = new EventEmitter();

  @Output('onedit')
  public onEdit: EventEmitter<void> = new EventEmitter();

  @Output('onadd')
  public onAdd: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {

    this.showEdit = typeof this.showEdit === 'boolean' ? this.showEdit : this.showEdit !== undefined;
    this.showBack = typeof this.showBack === 'boolean' ? this.showBack : this.showBack !== undefined;
    this.showAdd = typeof this.showAdd === 'boolean' ? this.showAdd : this.showAdd !== undefined;

  }

}
