import { Directive } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[confirmPassword]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: ConfirmPasswordDirective, multi: true }
  ]
})
export class ConfirmPasswordDirective implements Validator {

  constructor() { }

  public validate(control: AbstractControl): ValidationErrors {

    return control.value === control.parent.value.password ? null : { confirmPassword: false };

  }

}
