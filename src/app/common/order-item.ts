import { CartItem } from "./cart-item";

export class OrderItem {

    imageUrl: string = '';
    unitprice: number = 0;
    quantity: number = 0;
    productId: string = '';

    constructor(cartItem: CartItem){
        this.imageUrl = cartItem.imageUrl;
        this.productId = cartItem.id;
        this.quantity = cartItem.quantity;
        this.unitprice = cartItem.unitPrice;

    }

}
