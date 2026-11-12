import { Component, signal } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

interface FilterOption {
  key: string;
  label: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [HeaderComponent, BottomNavComponent],
  templateUrl: './history.component.html',
})
export class HistoryComponent {
  readonly filters: FilterOption[] = [
    { key: 'all', label: 'All (21)' },
    { key: 'on-time', label: 'On Time (19)' },
    { key: 'late', label: 'Late (1)' },
    { key: 'absent', label: 'Absent (1)' },
  ];

  readonly activeFilter = signal<string>('all');

  setFilter(key: string): void {
    this.activeFilter.set(key);
  }
}