import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { Order } from '../models/orders';

@Injectable({
  providedIn: 'root'
})
export class OrderserviceService {

  constructor(private http: HttpClient) { }

  private Url = 'https://realtimenotifications.onrender.com/Orders';
  getOrders(): Observable<any> {
    return this.http.get(this.Url);

  }
}
