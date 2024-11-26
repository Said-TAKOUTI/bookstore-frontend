import { FormControl, ValidationErrors } from '@angular/forms';

export class CustomFormValidators {
  // whitespace validator
  static notOnlyWhiteSpace(control: FormControl): ValidationErrors | null {
    // check if string only contains wwhitespace
    if (control.value != null && control.value.trim().length === 0) {
      // invalid, return error object
      return { notOnlyWhiteSpace: true };
    } else {
      //valid, return error object
      return null;
    }
  }
}
