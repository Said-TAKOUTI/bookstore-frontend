import { Component, OnInit } from '@angular/core';
import { ProductCategory } from '../../common/product-category';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-prduct-category-menu',
  templateUrl: './prduct-category-menu.component.html',
  styleUrl: './prduct-category-menu.component.css'
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
        console.log("Product Categories"+ JSON.stringify(data));
        this.productCategories = data;
      }
    )
  }

}
