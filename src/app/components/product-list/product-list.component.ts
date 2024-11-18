import { Component, OnInit } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { keyframes } from '@angular/animations';
import { KeyedWrite } from '@angular/compiler';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../common/cart-item';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {


  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;

  // new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  previousKeyWord: string="";

  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute
              ) { };

  ngOnInit(): void {

    this.route.paramMap.subscribe(() => {

      this.listProducts();
    }
    );

  }

  listProducts() {

    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handelSearchProducts();
    } else {
      this.handelListProducts();
    }

  }

  handelSearchProducts() {

    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;


      // check if we have a different keyword than previous
    
      // set thePageNumber to 1 
     // if we have a different keyword  than previous

     if(this.previousKeyWord != theKeyword){
        this.thePageNumber = 1;
     }

     this.previousKeyWord = theKeyword;

    this.productService.SearchProductsPaginate(this.thePageNumber - 1,
                                               this.thePageSize,       
                                               theKeyword).subscribe(this.processResult());  }

  handelListProducts() {

    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    } else {
      this.currentCategoryId = 1;
    }

    // check if we have a different category than previous
    
    // set thePageNumber back to 1 
    // if we have a different category id than previous
    if(this.previousCategoryId != this.currentCategoryId){
      this.thePageNumber = 1;
    }
    this.previousCategoryId = this.currentCategoryId;

    this.productService.getProductListPaginate(this.thePageNumber - 1,
                                       this.thePageSize,       
                                       this.currentCategoryId).subscribe(this.processResult());
  }
  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
    }
  
    processResult(){
      return (data:any) => {
        this.products = data._embedded.products;
        this.thePageNumber = data.page.number + 1;
        this.thePageSize = data.page.size;
        this.theTotalElements = data.page.totalElements;
      }
    }

    addToCart(theProduct: Product) {
        console.log(`the product name = ${theProduct.name} , the product price = ${theProduct.unitPrice}`);
        const theCartItem = new CartItem(theProduct);
        this.cartService.addToCart(theCartItem);
      }
}
