import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);

  getStatus(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/attendance/status`);
  }

  getHistory(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/attendance/my`);
  }

  checkIn(payload: any = {}): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}/attendance/check-in`,
      payload,
    );
  }

  checkOut(payload: any = {}): Observable<any> {
    return this.http.put<any>(
      `${environment.apiBaseUrl}/attendance/check-out`,
      payload,
    );
  }

  reverseGeocode(lat: number, lng: number): Promise<string | null> {
    return firstValueFrom(
      this.http.get<any>(NOMINATIM_REVERSE_URL, {
        params: {
          format: 'jsonv2',
          lat: String(lat),
          lon: String(lng),
          addressdetails: '1',
        },
      }),
    )
      .then((response) => response?.display_name || null)
      .catch(() => null);
  }
}