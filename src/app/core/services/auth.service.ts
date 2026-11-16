import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly tokenKey = '8tt_auth_token';
  private readonly userKey = '8tt_auth_user';

  private readonly currentUserSubject = new BehaviorSubject<any | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get currentUser(): any | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  bootstrapSession(): void {
    const token = localStorage.getItem(this.tokenKey);
    const storedUser = localStorage.getItem(this.userKey);

    if (!token) {
      return;
    }

    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch {
        this.currentUserSubject.next(null);
      }
    }

    this.fetchMe().subscribe();
  }

  login(payload: LoginPayload): Observable<any> {
    return this.http
      .post<any>(`${environment.apiBaseUrl}/auth/login`, payload)
      .pipe(
        tap((response) => {
          const token = response?.data?.token;
          const user = response?.data?.user || null;

          if (!token) {
            return;
          }

          localStorage.setItem(this.tokenKey, token);

          if (user) {
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        }),
      );
  }

  fetchMe(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/auth/me`).pipe(
      tap((response) => {
        const user = response?.data || null;

        if (!user) {
          return;
        }

        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(() => of(null)),
    );
  }

  logout(redirectToLogin = true): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);

    if (redirectToLogin) {
      void this.router.navigateByUrl('/login');
    }
  }

  decodeToken(): Record<string, any> | null {
    const token = this.token;

    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}