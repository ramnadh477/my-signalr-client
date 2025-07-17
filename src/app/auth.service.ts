import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url='https://realtimenotifications.onrender.com';
  private loginUrl = this.url+'/api/Login';
  private NotificationsUrl = this.url+'/Notification';
  logoutTimer: any;
  constructor(private http: HttpClient) { }

  login(username: string, password: string):Observable<any> {

    const credentials = { username, password };
    return this.http.post<any>(this.loginUrl, credentials);
  }
  getloginUser():any{
    return localStorage.getItem('username');
  }
  logout() {

    localStorage.clear();
    clearTimeout(this.logoutTimer);

  }
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decoded: any = jwtDecode(token);
    const exp = decoded.exp * 1000; // JWT exp is in seconds
    return Date.now() < exp;
  }
  autoLogout(token: string) {
    const decoded: any = jwtDecode(token);
    const exp = decoded.exp * 1000;
    const timeout = exp - Date.now();

    this.logoutTimer = setTimeout(() => {
      this.logout();
      alert('Session expired. Please log in again.');
    }, timeout);
  }
  getNotifications(id:any):Observable<any> {
    return this.http.get(this.NotificationsUrl+'?id='+id);
  }
  getunreadNotifications(id:any,read:any):Observable<any> {
    return this.http.get(this.NotificationsUrl+'/'+id+'/'+read);
  }
  postNotification(notification:any){

    return this.http.post<any>(this.NotificationsUrl, notification);
  }

}
