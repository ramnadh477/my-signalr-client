import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  title = 'my-signalr-client';
  auth = inject(AuthService);
  router =inject(Router);
  noticification=inject(NotificationService);
  usernameLogged =signal('');
   ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.usernameLogged.set( this.auth.getloginUser());
    }
  }
  logout() {
    this.auth.logout();
    this.noticification.revokeHub();
    this.router.navigate(['']);

  }
}
