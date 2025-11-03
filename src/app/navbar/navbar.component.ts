import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { APP_TEXT } from '../shared/constants';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly TEXT = APP_TEXT;

  constructor(private router: Router) {}

  navigateToTrending(): void {
    this.router.navigate(['/trending']).then(() => {
      window.location.reload();
    });
  }
}
