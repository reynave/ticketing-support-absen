import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: '',
})
export class AppComponent implements OnInit {
  title = 'absen';

  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.bootstrapSession();
  }
}