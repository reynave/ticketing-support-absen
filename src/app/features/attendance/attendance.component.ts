import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [HeaderComponent, BottomNavComponent],
  templateUrl: './attendance.component.html',
})
export class AttendanceComponent implements OnInit, OnDestroy {
  readonly now = signal<Date>(new Date());
  readonly isCheckedIn = signal<boolean>(false);
  readonly firstIn = signal<string>('--:--');
  readonly totalTime = signal<string>('0h 00m');

  readonly statusText = computed<string>(() =>
    this.isCheckedIn() ? 'Active On Shift' : 'Ready to Check In'
  );

  readonly actionText = computed<string>(() =>
    this.isCheckedIn() ? 'Tap to Check Out' : 'Tap to Check In'
  );

  private clockTimer?: ReturnType<typeof setInterval>;
  private shiftTimer?: ReturnType<typeof setInterval>;
  private shiftSeconds = 0;

  ngOnInit(): void {
    this.clockTimer = setInterval(() => this.now.set(new Date()), 1000);
  }

  ngOnDestroy(): void {
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }
    if (this.shiftTimer) {
      clearInterval(this.shiftTimer);
    }
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
    this.isCheckedIn.update((value) => !value);

    if (this.isCheckedIn()) {
      const date = new Date();
      const hours24 = date.getHours();
      const hours = hours24 % 12 || 12;
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const period = hours24 >= 12 ? 'PM' : 'AM';

      this.firstIn.set(`${String(hours).padStart(2, '0')}:${minutes} ${period}`);

      this.shiftSeconds = 0;
      this.totalTime.set('0h 00m');
      if (this.shiftTimer) {
        clearInterval(this.shiftTimer);
      }
      this.shiftTimer = setInterval(() => {
        this.shiftSeconds += 60;
        this.totalTime.set(this.formatDuration(this.shiftSeconds));
      }, 60000);
    } else {
      if (this.shiftTimer) {
        clearInterval(this.shiftTimer);
        this.shiftTimer = undefined;
      }
    }
  }

  private formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }
}