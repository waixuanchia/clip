import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterValidators } from '../validators/register-validators';
import { EmailExists } from '../validators/email-exists';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  constructor(private auth: AuthService, private emailValidator: EmailExists) {}
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email: FormControl = new FormControl(
    '',
    [Validators.required, Validators.email],
    [this.emailValidator.validate.bind(this.emailValidator)]
  );
  age = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(18),
    Validators.max(120),
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
  ]);
  confirm_password = new FormControl('', [Validators.required]);
  phone_number = new FormControl('', [
    Validators.required,
    Validators.minLength(13),
    Validators.maxLength(13),
  ]);
  registerForm = new FormGroup(
    {
      name: this.name,
      email: this.email,
      age: this.age,
      password: this.password,
      confirm_password: this.confirm_password,
      phone_number: this.phone_number,
    },
    [RegisterValidators.match('password', 'confirm_password')]
  );
  showAlert = false;
  alertMessage = 'Your Account are creating';
  alertColor = 'blue';
  isSubmitting = false;

  ngOnInit(): void {
    console.log(this.name);
  }

  async register() {
    this.showAlert = true;
    this.alertMessage = 'Your Account are creating';
    this.alertColor = 'blue';
    this.isSubmitting = true;

    const { email, password } = this.registerForm.value;

    try {
      await this.auth.createUser(this.registerForm.value as IUser);
    } catch (error) {
      this.alertMessage = 'An unexpected error, please try again later';
      this.alertColor = 'red';
      this.isSubmitting = false;
      return;
    }

    this.alertMessage = 'Success, your account has been created';
    this.alertColor = 'green';
  }
}
