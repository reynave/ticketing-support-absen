import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  getProfile(id: string): Observable<any> {
    return this.http.get<any>(
      `${environment.apiBaseUrl}/user/${encodeURIComponent(id)}`,
    );
  }
}