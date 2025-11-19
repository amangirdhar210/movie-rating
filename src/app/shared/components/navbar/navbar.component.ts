import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { NAV_TEXT } from '../../constants/app.constants';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly TEXT = NAV_TEXT;

  constructor(private router: Router) {}

  navigateToTrending(): void {
    this.router.navigate(['/trending']);
  }
}
