import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Input() logoUrl =
    'https://8thinktank.com/wp-content/uploads/2024/05/think-tank-solusindo.png';
  @Input() logoAlt = 'Thinktank Logo';
  @Input() title?: string;
  @Input() subtitle?: string;

  readonly profileUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBq566SH8nUEbo6TRZ2dMta7HT8UNDoFDuX2eqcwaa4L7uC43pxCsq-E-7_vxmSgxj4QoLtCjcGAQeuZvo5hAyzzN8j03GwA-fNwxbiLN0jt8w3zUDMW44xppnZs4MP-PXXGp6xVqjyuz61_jVEvVJz0-C2Uo8QbxKGFoulaVr1GyjVa6ITDz42VmQY8jbXEyxEGygrEQRtyFD0aUHgmYShZMgy_ItQUPk1rlyt4Hg';
}