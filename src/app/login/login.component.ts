import { Component, inject, NgModule, signal } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Notification } from '../../app/models/notifications';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  username = signal('');
  password = signal('');
  router = inject(Router);

  constructor(private authService: AuthService) { }

  onSubmit() {

    console.log(this.username())
    this.authService.login(this.username(), this.password()).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.user.userName);
        localStorage.setItem('userId', response.user.userId);
        this.authService.autoLogout(response.token)
        this.router.navigate(['/Notification'])
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }
}
