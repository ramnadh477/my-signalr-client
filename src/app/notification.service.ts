import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { Notification } from './models/notifications';
import { AuthService } from './auth.service';
import { userGroupsDto } from './models/userGroupsDto';

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
    const localuserId: number = +localStorage.getItem("userId")!;
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`https://realtimenotifications.onrender.com/Client?access_token=` + localStorage.getItem('token'), {
        withCredentials: false,

      })
      .configureLogging(signalR.LogLevel.Information)
      .build();
    this.currentNotifications = [];
    this.currentGroupNotifications = [];
    this.hubConnection.start().then(() => {
      console.log('SignalR Connected.');

      this.hubConnection.invoke("SendNotification", "234", "Hello from client!")
        .catch(err => console.error(err.toString()));
      this.connectionStarted.next(true);
    });

    this.hubConnection.on("ReceiveConnectionId", (message: string) => {
      console.log("Connection ID received: " + message);
      localStorage.setItem("connectionId", message);

    });

    this.hubConnection.on("ReceiveNotification", (message: string) => {
      const notification: Notification = {
        id: localuserId,
        userId: localuserId,
        message,
        isRead: false,
        timestamp: new Date()
      };

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
      if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
        this.addNotificationHub(notification);
      }
      else
        console.error("SignalR is not connected.");
      this.currentNotifications = [notification, ...this.currentNotifications];
      this._notifications.next(this.currentNotifications);
    });
  }
  addNotificationHub(ntf: Notification) {
    this.hubConnection.invoke("AddNotification", ntf.id, ntf.userId, ntf.message, ntf.isRead, ntf.timestamp)
      // this.hubConnection.invoke("AddNotification")
      .then(() => console.log("successful"))
      .catch(err => console.error(err.toString()));
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
  invokejoinGroups(groupNames: string[]) {
    this.hubConnection.invoke('JoinGroups', groupNames)
      .catch(err => console.error('JoinGroups error:', err));
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
  invokJoinGroupHub(usergroup: userGroupsDto) {

    this.hubConnection.invoke("JoinGroup", usergroup)
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
