import { Routes } from '@angular/router';
import { NotificationsComponent } from './Components/notifications/notifications.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [{
  path:'',
  component: LoginComponent
},
{
  path:'Notification',
  component: NotificationsComponent,
  canActivate: [authGuard]
}
];
