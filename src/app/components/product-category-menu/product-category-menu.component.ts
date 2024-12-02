import { Component, OnInit } from '@angular/core';
import { ProductCategory } from '../../common/product-category';
import { ProductService } from '../../services/product.service';

@Component({
    selector: 'app-product-category-menu',
    templateUrl: './product-category-menu.component.html',
    styleUrl: './product-category-menu.component.css',
    standalone: false
})
export class PrductCategoryMenuComponent implements OnInit{

  productCategories : ProductCategory[] = [];

  constructor(private productService : ProductService){}

  ngOnInit(): void {
    this.listProductCategories();
  }
  listProductCategories() {
    this.productService.getProductCategories().subscribe(
      data =>{
        this.productCategories = data;
      }
    )
  }

}
