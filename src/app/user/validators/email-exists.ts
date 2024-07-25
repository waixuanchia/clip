import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailExists implements AsyncValidator {
  constructor(private auth: AngularFireAuth) {}

  validate(control: AbstractControl<string>): Promise<ValidationErrors | null> {
    console.log(this);
    return this.auth
      .fetchSignInMethodsForEmail(control.value)
      .then((response) => {
        console.log(response);
        if (response.length > 0) {
          return { emailExists: true };
        } else {
          return null;
        }
      });
  }
}
