export interface Order {
  id: number;
  customerName: string;
  product: string;
  quantity: number;
  price: number;
  date: string;
  status:string;
  isEditable:boolean;
}
