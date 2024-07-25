import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  showAlert = false;
  alertColor = '';
  alertMessage = '';
  isSubmitting = false;
  constructor(private auth: AuthService) {}
  credentials = {
    email: '',
    password: '',
  };

  async login() {
    this.isSubmitting = true;
    try {
      this.auth.signIn(this.credentials.email, this.credentials.password);

      this.showAlert = true;
      this.alertColor = 'green';
      this.alertMessage = 'You are signed in';
      this.isSubmitting = false;
    } catch (err) {
      this.showAlert = true;
      this.alertColor = 'red';
      this.alertMessage = 'Unexpected error occur';
      this.isSubmitting = false;
    }
  }
}
