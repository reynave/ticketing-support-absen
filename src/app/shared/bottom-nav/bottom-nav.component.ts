import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type NavTab = 'attendance' | 'history' | 'profile';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.css',
})
export class BottomNavComponent {
  @Input() active: NavTab = 'attendance';
}