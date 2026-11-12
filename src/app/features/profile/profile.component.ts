import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderComponent, BottomNavComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  confirmLogout(): void {
    // TODO: Integrasikan logout dengan auth service (hapus token 8tt_ dari localStorage).
    console.log('Logout requested');
  }
}