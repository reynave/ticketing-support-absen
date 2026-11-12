import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface LoginForm {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  form: LoginForm = {
    identifier: '',
    password: '',
    rememberMe: true,
  };

  showPassword = signal<boolean>(false);

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(): void {
    // TODO: Integrasikan dengan REST API login di sini (saat ini baru template).
    console.log('Login submitted', this.form);
  }
}