import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-input-modal',
  templateUrl: './input-modal.component.html',
  styleUrls: ['./input-modal.component.scss']
})
export class InputModalComponent implements OnInit {

  @Output('onsubmit')
  public onSubmit: EventEmitter<string> = new EventEmitter<any>();

  @Output('oncancel')
  public onCancel: EventEmitter<void> = new EventEmitter<void>();

  @Input('default-text')
  public defaultText: string = '';

  @Input('placeholder')
  public placeholder: string = '';

  @Input('secondary-input')
  public secondaryInput: boolean;

  @Input('secondary-placeholder')
  public secondaryPlaceholder: string = '';

  @Input('secondary-default-text')
  public secondaryDefaultText: string = '';

  @Input('input-type')
  public inputType: string = 'text';

  @Input('secondary-input-type')
  public secondaryInputType: string = 'text';

  constructor() { }

  ngOnInit() {

    this.secondaryInput = this.secondaryInput !== undefined;

  }

  public inputSubmit(form: NgForm): void {

    if ( form.invalid ) return;

    this.onSubmit.emit(form.value);

  }

  public cancel(): void {

    this.onCancel.emit();

  }

}
