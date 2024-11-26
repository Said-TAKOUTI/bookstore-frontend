import { Address } from './address';
import { Customer } from './customer';
import { OrderItem } from './order-item';
import { Orders } from './orders';

export class Purchase {
  customer!: Customer;
  shippingAddress!: Address;
  billingAddress!: Address;
  orders!: Orders;
  orderItems!: OrderItem[];
}
