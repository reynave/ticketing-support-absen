import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { buildInfo } from '../../../../environments/build-info';

interface LoginForm {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form: LoginForm = {
    identifier: '',
    password: '',
    rememberMe: true,
  };

  showPassword = signal<boolean>(false);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  ngBuildCode: string = buildInfo.buildCode;

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      void this.router.navigateByUrl('/attendance');
    }
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.loading()) {
      return;
    }

    const email = this.form.identifier.trim();
    const password = this.form.password;

    if (!email || !password) {
      this.errorMessage.set('Email and password are required.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl('/attendance');
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'Login failed. Please try again.',
        );
      },
    });
  }
}