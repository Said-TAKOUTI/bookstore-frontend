import { Component } from '@angular/core';
import { Product } from './product';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
 //templateUrl: './product-list.component.html',
  templateUrl: './product-list-table.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {

   products : Product[] = [];

   constructor(private productService : ProductService){};

   ngOnInit(): void {

    this.listProducts();
  
   }
  
   listProducts() {

    
    this.productService.getProductList().subscribe(
      data => {
        this.products = data;
      }
    )
  }
}
