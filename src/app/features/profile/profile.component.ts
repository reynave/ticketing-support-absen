import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HeaderComponent, BottomNavComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  readonly loading = signal<boolean>(true);
  readonly initials = signal<string>('');
  readonly fullName = signal<string>('');
  readonly position = signal<string>('');
  readonly statusLabel = signal<string>('');
  readonly employeeId = signal<string>('');
  readonly department = signal<string>('');
  readonly email = signal<string>('');
  readonly phone = signal<string>('');
  readonly tenure = signal<string>('');

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    const userId =
      this.authService.currentUser?.id || this.authService.decodeToken()?.['id'];

    if (!userId) {
      this.loading.set(false);
      return;
    }

    this.userService.getProfile(userId).subscribe({
      next: (response) => {
        this.applyUser(response?.data || {});
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private applyUser(user: any): void {
    const firstName = user.firstName ? String(user.firstName).trim() : '';
    const lastName = user.lastName ? String(user.lastName).trim() : '';
    const name = [firstName, lastName].filter(Boolean).join(' ');

    this.fullName.set(name);
    this.initials.set(this.toInitials(name));
    this.position.set(user.position ? String(user.position).trim() : '');
    this.employeeId.set(user.id ? String(user.id) : '');
    this.department.set(user.division ? String(user.division).trim() : '');
    this.email.set(user.email ? String(user.email) : '');
    this.phone.set(this.pickPhone(user));

    const typeLabel = Number(user.userTypeId) === 2 ? 'External' : 'Internal';
    const active = Number(user.status) === 1 ? 'Active' : 'Inactive';
    this.statusLabel.set(`${active} • ${typeLabel}`);

    this.tenure.set(this.toTenure(user.inputDate));
  }

  private pickPhone(user: any): string {
    const phone = user.phone ? String(user.phone).trim() : '';
    const mobile = user.mobile ? String(user.mobile).trim() : '';
    return phone || mobile;
  }

  private toInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ').filter(Boolean);
    if (!parts.length) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  private toTenure(inputDate: any): string {
    const start = this.toDate(inputDate);
    if (!start) return '';

    const now = new Date();
    let months =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) months -= 1;
    if (months < 0) months = 0;

    const years = Math.floor(months / 12);
    const rem = months % 12;

    if (years && rem) return `${years} yrs ${rem} mos`;
    if (years) return `${years} yrs`;
    return `${rem} mos`;
  }

  private toDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const d = new Date(String(value).replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
  }

  confirmLogout(): void {
    this.authService.logout(true);
  }
}