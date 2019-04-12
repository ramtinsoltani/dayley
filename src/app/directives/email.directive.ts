import { Directive } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[validateEmail]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: EmailDirective, multi: true }
  ]
})
export class EmailDirective implements Validator {

  constructor() { }

  public validate(control: AbstractControl): ValidationErrors {

    return /^[a-z0-9-_.]+@[a-z0-9-]+\.[a-z]+$/i.test(control.value) ? null : { validateEmail: false };

  }

}
