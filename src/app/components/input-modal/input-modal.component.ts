import { Component, Output, Input, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-input-modal',
  templateUrl: './input-modal.component.html',
  styleUrls: ['./input-modal.component.scss']
})
export class InputModalComponent {

  @Output('onsubmit')
  public onSubmit: EventEmitter<string> = new EventEmitter<string>();

  @Output('oncancel')
  public onCancel: EventEmitter<void> = new EventEmitter<void>();

  @Input('default-text')
  public defaultText: string = '';

  constructor() { }

  public inputSubmit(form: NgForm): void {

    if ( form.invalid ) return;

    this.onSubmit.emit(form.value.input);

  }

  public cancel(): void {

    this.onCancel.emit();

  }

}
