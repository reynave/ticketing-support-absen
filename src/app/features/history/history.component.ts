import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../core/services/attendance.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

interface HistoryItem {
  index: number;
  day: string;
  dayNumber: string;
  title: string;
  subtitle: string;
  statusLabel: string;
  badgeClass: string;
  checkInText: string;
  checkOutText: string;
  duration: string;
  location: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, HeaderComponent, BottomNavComponent],
  templateUrl: './history.component.html',
})
export class HistoryComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);

  readonly loading = signal<boolean>(true);
  readonly items = signal<HistoryItem[]>([]);
  readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadHistory();
  }

  private loadHistory(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.attendanceService.getHistory().subscribe({
      next: (response) => {
        const rows: any[] = response?.data || [];
        this.items.set(rows.map((row, index) => this.toItem(row, index)));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Failed to load history.');
      },
    });
  }

  private toItem(record: any, index: number): HistoryItem {
    const workDate = this.toDate(record.workDate);
    const checkedIn = Number(record.checkIn) === 1;
    const checkedOut = Number(record.checkOut) === 1;
    const late = this.isLate(record.checkInDateTime);

    let statusLabel = 'Not Checked In';
    let badgeClass = 'bg-secondary-subtle text-secondary-emphasis';

    if (checkedIn && !checkedOut) {
      statusLabel = 'Missing Check-out';
      badgeClass = 'bg-warning-subtle text-warning-emphasis';
    } else if (checkedIn && checkedOut && late) {
      statusLabel = 'Late';
      badgeClass = 'bg-warning-subtle text-warning-emphasis';
    } else if (checkedIn && checkedOut) {
      statusLabel = 'On Time';
      badgeClass = 'bg-success-subtle text-success-emphasis';
    }

    return {
      index,
      day: workDate ? workDate.toLocaleDateString('en-US', { weekday: 'short' }) : '--',
      dayNumber: workDate ? String(workDate.getDate()) : '--',
      title: workDate ? workDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--',
      subtitle: 'Standard Shift (8h required)',
      statusLabel,
      badgeClass,
      checkInText: this.timeText(record.checkInDateTime),
      checkOutText: this.timeText(record.checkOutDateTime),
      duration: this.durationText(record),
      location: this.addressText(checkedOut ? record.checkOutAddress : record.checkInAddress),
    };
  }

  private toDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const d = new Date(String(value).replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
  }

  private isLate(checkInDateTime: any): boolean {
    const d = this.toDate(checkInDateTime);
    if (!d) return false;
    return d.getHours() * 60 + d.getMinutes() > 8 * 60 + 15;
  }

  private timeText(datetime: any): string {
    const d = this.toDate(datetime);
    return d ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  }

  private durationText(record: any): string {
    const start = this.toDate(record.checkInDateTime);
    if (!start) return '0h 0m';
    const end = Number(record.checkOut) === 1 ? this.toDate(record.checkOutDateTime) : null;
    const to = end || new Date();
    const mins = Math.max(0, Math.floor((to.getTime() - start.getTime()) / 60000));
    return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;
  }

  private addressText(value: any): string {
    const text = value ? String(value).trim() : '';
    return text || 'Location unavailable';
  }
}