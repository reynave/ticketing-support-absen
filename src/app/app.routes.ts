import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { AttendanceComponent } from './features/attendance/attendance.component';
import { HistoryComponent } from './features/history/history.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: 'login' },
];
