import { Component, NgModule, OnInit, signal } from '@angular/core';
import { NotificationService } from '../../notification.service';
import { Notification } from '../../models/notifications';
import { DatePipe, NgIf, NgFor, JsonPipe } from '@angular/common';
import { OrderserviceService } from '../../service/orderservice.service';
import { Order } from '../../models/orders';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-notifications',
  imports: [NgIf, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  groupnotifications: Notification[] = [];
  orders = signal<Order[]>([]);
  private destroy$ = new Subject<void>();
  constructor(private authService: AuthService, private notificationService: NotificationService, private orderService: OrderserviceService) { }

  ngOnInit(): void {
    this.notificationService.notifications$.pipe(takeUntil(this.destroy$)).subscribe(n => this.notifications = n);
    this.notificationService.groupnotifications$.pipe(takeUntil(this.destroy$)).subscribe(n => this.groupnotifications = n);
    this.notificationService.startConnection("user-id-123");
    this.notificationService.getNotifications();
    this.orderService.getOrders().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.orders.set(response);
        console.log('Login successful', response);

      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });

  }
  markAsRead(id: any,userID :any, message:any , IsRead :any , date:any ) {
    this.notificationService.markAsRead(id,userID,message,IsRead,date);
  }

  markAsUnread(id: any,userID :any, message:any , IsRead :any , date:any) {
    this.notificationService.markAsUnread(id,userID,message,IsRead,date);
  }

  enableEditMode(item: any): void {
    const updated = this.orders().map(order =>
      order.id === item.id ? { ...order, isEditable: !item.isEditable } : order
    );
    this.orders.set(updated);
  }
  saveChanges(item: any): void {

    const updated = this.orders().map(order =>
      order.id === item.id ? {
        ...order, isEditable: !item.isEditable, status: item.status,
        product: item.product, price: item.price
      } : order
    );
    this.orders.set(updated);
    const message = 'Product ' + item.product + ' Modified';
    this.notificationService.invokeHub(item.product, message);
    //this.notificationService.invokeHub(item.id, 'Updated Order no: ' + item.id + ' Order Status: ' + item.status)


  }
  getunreadNotifications(event: Event){
    const read = (event.target as HTMLInputElement).checked;
    this.notificationService.getunreadNotifications(read);
  }

  cancelEdit(item: any): void {

    item.editMode = false;
  }
  joinGroup(groupName: string) {
    this.notificationService.invokJoinGroupHub(groupName)
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
