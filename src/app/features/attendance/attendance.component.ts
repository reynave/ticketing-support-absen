import { CommonModule } from '@angular/common';
import { Component, computed, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { AttendanceService } from '../../core/services/attendance.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, HeaderComponent, BottomNavComponent],
  templateUrl: './attendance.component.html',
})
export class AttendanceComponent implements OnInit, OnDestroy {
  private readonly attendanceService = inject(AttendanceService);

  readonly now = signal<Date>(new Date());
  readonly isCheckedIn = signal<boolean>(false);
  readonly firstIn = signal<string>('--:--');
  readonly totalTime = signal<string>('0h 00m');
  readonly busy = signal<boolean>(false);
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');
  readonly locationText = signal<string>('No location data');
  readonly locationLabel = signal<string>('Check In');

  readonly statusText = computed<string>(() =>
    this.isCheckedIn() ? 'Active On Shift' : 'Ready to Check In'
  );

  readonly actionText = computed<string>(() =>
    this.isCheckedIn() ? 'Tap to Check Out' : 'Tap to Check In'
  );

  private clockTimer?: ReturnType<typeof setInterval>;
  private shiftTimer?: ReturnType<typeof setInterval>;
  private checkInDateTime?: string;

  ngOnInit(): void {
    this.clockTimer = setInterval(() => this.now.set(new Date()), 1000);
    this.loadStatus();
  }

  ngOnDestroy(): void {
    if (this.clockTimer) clearInterval(this.clockTimer);
    if (this.shiftTimer) clearInterval(this.shiftTimer);
  }

  get clockText(): string {
    const date = this.now();
    const hours24 = date.getHours();
    const hours = hours24 % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  get ampm(): string {
    return this.now().getHours() >= 12 ? 'PM' : 'AM';
  }

  get dateText(): string {
    return this.now().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  toggleClock(): void {
    if (this.busy()) return;
    if (this.isCheckedIn()) this.doCheckOut();
    else this.doCheckIn();
  }

  private loadStatus(): void {
    this.loading.set(true);

    this.attendanceService.getStatus().subscribe({
      next: (response) => {
        this.loading.set(false);

        const status = response?.data;
        if (status?.checkedIn) {
          this.isCheckedIn.set(true);
          this.checkInDateTime = this.sqlToIso(status.record?.checkInDateTime);
          this.firstIn.set(this.formatTime(this.checkInDateTime));
          this.locationText.set(this.displayAddress(status.record?.checkInAddress));
          this.locationLabel.set('Check In');
          this.startShiftTimer();
        } else {
          this.locationText.set(this.displayAddress(status.lastRecord?.checkOutAddress));
          this.locationLabel.set('Check Out');
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private async doCheckIn(): Promise<void> {
    this.busy.set(true);
    this.errorMessage.set('');

    const payload = await this.resolveLocationPayload();

    this.attendanceService.checkIn(payload || {}).subscribe({
      next: (response) => {
        this.busy.set(false);
        const record = response?.data;
        if (!record) {
          this.errorMessage.set('Check-in failed. Please try again.');
          return;
        }

        this.isCheckedIn.set(true);
        this.checkInDateTime = this.sqlToIso(record.checkInDateTime);
        this.firstIn.set(this.formatTime(this.checkInDateTime));
        this.totalTime.set('0h 00m');
        this.locationText.set(this.displayAddress(record.checkInAddress));
        this.locationLabel.set('Check In');
        this.startShiftTimer();
      },
      error: (error) => {
        this.busy.set(false);
        this.errorMessage.set(
          error?.error?.message || 'Check-in failed. Please try again.',
        );
      },
    });
  }

  private async doCheckOut(): Promise<void> {
    this.busy.set(true);
    this.errorMessage.set('');

    const payload = await this.resolveLocationPayload();

    this.attendanceService.checkOut(payload || {}).subscribe({
      next: (response) => {
        this.busy.set(false);
        this.isCheckedIn.set(false);
        this.stopShiftTimer();
        this.locationText.set(this.displayAddress(response?.data?.checkOutAddress));
        this.locationLabel.set('Check Out');
      },
      error: (error) => {
        this.busy.set(false);
        this.errorMessage.set(
          error?.error?.message || 'Check-out failed. Please try again.',
        );
      },
    });
  }

  private getLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
      );
    });
  }

  private async resolveLocationPayload(): Promise<{ lat: number; lng: number; address: string | null } | null> {
    const location = await this.getLocation();

    if (!location) {
      return null;
    }

    const address = await this.attendanceService.reverseGeocode(
      location.lat,
      location.lng,
    );

    return {
      lat: location.lat,
      lng: location.lng,
      address,
    };
  }

  private displayAddress(value: any): string {
    const text = value ? String(value).trim() : '';
    return text || 'Location unavailable';
  }

  private startShiftTimer(): void {
    this.stopShiftTimer();
    this.shiftTimer = setInterval(() => this.updateTotalTime(), 1000);
  }

  private stopShiftTimer(): void {
    if (this.shiftTimer) {
      clearInterval(this.shiftTimer);
      this.shiftTimer = undefined;
    }
  }

  private updateTotalTime(): void {
    this.totalTime.set(this.formatDuration(this.elapsedSeconds(this.checkInDateTime)));
  }

  private elapsedSeconds(iso?: string): number {
    if (!iso) return 0;
    const date = new Date(iso);
    if (isNaN(date.getTime())) return 0;
    return Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  }

  private sqlToIso(value: any): string | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value.toISOString();
    const text = String(value).replace(' ', 'T');
    return isNaN(new Date(text).getTime()) ? undefined : text;
  }

  private formatTime(iso?: string): string {
    const date = iso ? new Date(iso) : null;
    if (!date || isNaN(date.getTime())) return '--:--';

    const hours24 = date.getHours();
    const hours = hours24 % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours24 >= 12 ? 'PM' : 'AM';
    return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
  }

  private formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }
}