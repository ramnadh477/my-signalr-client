import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { Notification } from './models/notifications';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private authService: AuthService) { }
  private hubConnection!: signalR.HubConnection;
  private connectionStarted = new BehaviorSubject<boolean>(false);
  public connectionStarted$ = this.connectionStarted.asObservable();
  private _notifications = new BehaviorSubject<Notification[]>([]);
  private _groupnotifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this._notifications.asObservable();
  groupnotifications$ = this._groupnotifications.asObservable();

  private currentNotifications: Notification[] = [];
  private currentGroupNotifications: Notification[] = [];

  startConnection(userId: string) {
    const localuserId = localStorage.getItem("userId");
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`https://localhost:7006/Client?access_token=` + localStorage.getItem('token'), {
        withCredentials: false,

      })
      .configureLogging(signalR.LogLevel.Information)
      .build();
    this.currentNotifications = [];
    this.currentGroupNotifications = [];
    this.hubConnection.start().then(() => {
      console.log('SignalR Connected.');
      // this.hubConnection.invoke("SendNotification", "234", "Hello from client!")
      //   .catch(err => console.error(err.toString()));
      this.connectionStarted.next(true);
    });

    this.hubConnection.on("ReceiveNotification", (message: string) => {
      const notification: Notification = {
        id: localuserId,
        userId: localuserId,
        message,
        isRead: false,
        timestamp: new Date()
      };
      this.authService.postNotification(notification).subscribe({
        next: (response) => { },
        error: (error) => {
          console.error('Login failed', error);
        }
      });
      this.currentNotifications = [notification, ...this.currentNotifications];
      this._notifications.next(this.currentNotifications);
    });

    this.hubConnection.on("ReceiveGroupNotification", (message: string) => {
      const notification: Notification = {
        id: localuserId,
        userId: localuserId,
        message,
        isRead: false,
        timestamp: new Date()
      };
      this.authService.postNotification(notification).subscribe({
        next: (response) => { },
        error: (error) => {
          console.error('Login failed', error);
        }
      })
      this.currentGroupNotifications = [notification, ...this.currentGroupNotifications];
      this._groupnotifications.next(this.currentGroupNotifications);
    });
  }

  markAsRead(id: any, userID: any, message: any, IsRead: any, date: any) {
    this.currentNotifications = this.currentNotifications.map(n =>
      n.id === id ? { ...n, isRead: !IsRead } : n
    );
    this.hubConnection.invoke("UpdateNotification", id, userID, message, !IsRead, date)
      .then(() => console.log("successful"))
      .catch(err => console.error(err.toString()));
    this._notifications.next(this.currentNotifications);
  }

  markAsUnread(id: any, userID: any, message: any, IsRead: any, date: any) {
    this.currentNotifications = this.currentNotifications.map(n =>
      n.id === id ? { ...n, isRead: !IsRead } : n
    );
    this.hubConnection.invoke("UpdateNotification", id, userID, message, !IsRead, date)
      .then(() => console.log("successful"))
      .catch(err => console.error(err.toString()));
    this._notifications.next(this.currentNotifications);
  }
  invokeHub(id: string, message: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      console.log(message + id);

      this.hubConnection.invoke("SendNotification", id, message)
        .then(() => console.log("successful"))
        .catch(err => console.error(err.toString()));
    }
    else {
      console.error("SignalR is not connected.");
    }
  }
  invokJoinGroupHub(groupName: string) {
    this.hubConnection.invoke("JoinGroup", groupName)
      .then(() => console.log("successful"))
      .catch(err => console.error(err.toString()));
  }
  revokeHub() {
    this.hubConnection.stop();
  }
  getunreadNotifications(read: any) {
    const userId = localStorage.getItem("userId");
    this.authService.getunreadNotifications(userId, read).subscribe({
      next: (response: Notification[]) => {
        this.currentNotifications = [];
        this.currentNotifications = [...response, ...this.currentNotifications];
        this._notifications.next(this.currentNotifications);

      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }
  getNotifications() {
    console.log(localStorage.getItem("userId"))
    const userId = localStorage.getItem("userId");
    this.authService.getNotifications(userId).subscribe({
      next: (response: Notification[]) => {

        this.currentNotifications = [...response, ...this.currentNotifications];
        this._notifications.next(this.currentNotifications);

      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }
}
