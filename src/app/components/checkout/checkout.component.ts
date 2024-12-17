import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormService } from '../../services/form.service';
import { Country } from '../../common/country';
import { Province } from '../../common/province';
import { CustomFormValidators } from '../../common/custom-form-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { Order } from '../../common/order';
import { environment } from '../../../environments/environment.development';
import { PaymentInfo } from '../../common/payment-info';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
  standalone: false,
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;
  showBillingForm: boolean = true;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countyList: Country[] = [];

  shippingAddressProvinces: Province[] = [];
  billingAddressProvinces: Province[] = [];

  storage: Storage = sessionStorage;

  // intialize Stripe API
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = '';

  buttonPurchuseIsDisabled: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private formService: FormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // read the user's email address from browser Storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomFormValidators.notOnlyWhiteSpace,
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomFormValidators.notOnlyWhiteSpace,
        ]),
        email: new FormControl(theEmail, [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        country: ['', [Validators.required]],
        street: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            CustomFormValidators.notOnlyWhiteSpace,
          ],
        ],
        city: ['', [Validators.required]],
        province: ['', [Validators.required]],
        zipCode: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            CustomFormValidators.notOnlyWhiteSpace,
          ],
        ],
      }),
      billingAddress: this.formBuilder.group({
        country: ['', [Validators.required]],
        street: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            CustomFormValidators.notOnlyWhiteSpace,
          ],
        ],
        city: ['', [Validators.required]],
        province: ['', [Validators.required]],
        zipCode: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            CustomFormValidators.notOnlyWhiteSpace,
          ],
        ],
      }),
      creditCard: this.formBuilder.group({}),
    });

    //fetch all countries
    this.handleCountries();

    this.reviewCartDetails();

    //set up Stripe Payment Form
    this.setupStripePaymentForm();
  }

  setupStripePaymentForm() {
    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // Create a card element ... andi hide the zip-code field
    this.cardElement = elements.create('card', { hidePostalCode: true });

    // Add an instance of card UI component into the 'card-elemnt div
    this.cardElement.mount('#card-element');

    // Add event binding for the 'change' event on card eement
    this.cardElement.on('change', (event: any) => {
      //get a handle to card errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = '';
      } else if (event.error) {
        this.displayError.textContent = event.error.message;
      }
    });
  }

  // Getters
  get shippingAddressFormGroup(): FormGroup {
    return this.checkoutFormGroup.get('shippingAddress') as FormGroup;
  }

  get billingAddressFormGroup(): FormGroup {
    return this.checkoutFormGroup.get('billingAddress') as FormGroup;
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }

  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }

  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }

  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }

  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }

  get shippingAddressProvince() {
    return this.checkoutFormGroup.get('shippingAddress.province');
  }

  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }

  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }

  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }

  get billingAddressProvince() {
    return this.checkoutFormGroup.get('billingAddress.province');
  }

  get billingAddressZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }

  get creditCardCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }

  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }

  get creditCardCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }

  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }
  toggleBillingForm(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.showBillingForm = !inputElement.checked;
  }

  copyShippingAddressToBillingAddress(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.checked) {
      const billingAddressFormGroup = this.checkoutFormGroup.controls[
        'billingAddress'
      ] as FormGroup;
      const shippingAddressFormGroup = this.checkoutFormGroup.controls[
        'shippingAddress'
      ] as FormGroup;
      billingAddressFormGroup.setValue(shippingAddressFormGroup.value);

      this.billingAddressProvinces = this.shippingAddressProvinces;
    } else {
      this.billingAddressFormGroup.reset();

      this.billingAddressProvinces = [];
    }
  }
  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get(
      'creditCard'
    ) as FormGroup;

    const currentYear = new Date().getFullYear();
    const selectedYear = Number(creditCardFormGroup.value.expirationYear);

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.formService
      .getCreditCardMonths(startMonth)
      .subscribe((data) => (this.creditCardMonths = data));
  }
  handleCountries() {
    this.formService
      .getCountries()
      .subscribe((data) => (this.countyList = data));
  }

  getProvinces(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;

    this.formService.getProvinces(countryCode).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressProvinces = data;
      } else {
        this.billingAddressProvinces = data;
      }

      //select first item by default
      formGroup?.get('province')?.setValue(data[0]);
    });
  }
  getCountries(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;

    this.formService.getCountries().subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressProvinces = data;
      } else {
        this.billingAddressProvinces = data;
      }

      //select first item by default
      formGroup?.get('country')?.setValue(data[0]);
    });
  }
  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      (totalQuantity) => (this.totalQuantity = totalQuantity)
    );
    this.cartService.totalPrice.subscribe(
      (totalPrice) => (this.totalPrice = totalPrice)
    );
  }
  onSubmit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let orders = new Order(this.totalQuantity, this.totalPrice);
    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItem
    let orderItems: OrderItem[] = cartItems.map(
      (tempCartItem) => new OrderItem(tempCartItem)
    );

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress =
      this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingProvince: Province = JSON.parse(
      JSON.stringify(purchase.shippingAddress.province)
    );
    const shippingCountry: Country = JSON.parse(
      JSON.stringify(purchase.shippingAddress.country)
    );
    purchase.shippingAddress.province = shippingProvince.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress =
      this.checkoutFormGroup.controls['billingAddress'].value;
    const billingAddressProvince: Province = JSON.parse(
      JSON.stringify(purchase.billingAddress.province)
    );
    const billingAddressCountry: Country = JSON.parse(
      JSON.stringify(purchase.billingAddress.country)
    );
    purchase.billingAddress.province = billingAddressProvince.name;
    purchase.billingAddress.country = billingAddressCountry.name;

    // populate purchase - order and orderItems
    purchase.order = orders;
    purchase.orderItems = orderItems;

    // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = 'EUR';
    this.paymentInfo.receiptEmail = purchase.customer.email;

    // if valid form then
    // - create payment intent
    // - confirm card payment
    // - place order
    if (
      !this.checkoutFormGroup.invalid &&
      this.displayError.textContent === ''
    ) {
      this.buttonPurchuseIsDisabled = true;
      this.checkoutService
        .createPaymentIntent(this.paymentInfo)
        .subscribe((paymentIntentResponse) => {
          this.stripe
            .confirmCardPayment(
              paymentIntentResponse.client_secret,
              {
                payment_method: {
                  card: this.cardElement,
                  billing_details: {
                    email: purchase.customer.email,
                    name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                    address: {
                      line1: purchase.billingAddress.street,
                      city: purchase.billingAddress.city,
                      province: purchase.billingAddress.province,
                      country: this.billingAddressCountry?.value.code,
                    },
                  },
                },
              },
              { handleActions: false }
            )
            .then((result: any) => {
              if (result.error) {
                // inform the customer if there was an error
                alert(`There was an error: ${result.error.message}`);
                this.buttonPurchuseIsDisabled = false;
              } else {
                //call Rest API via the CheckoutService
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    alert(
                      `Your order has been recieved. \nOrderTrakink number: ${response.orderTrackingNumber}`
                    );

                    //reset cart
                    this.resetCart();
                    this.buttonPurchuseIsDisabled = false;
                  },
                  error: (err: any) => {
                    alert(`There was an error: ${err.message}`);
                    this.buttonPurchuseIsDisabled = false;
                  },
                });
              }
            });
        });
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
  }
  resetCart() {
    // resret cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();
    // reset the form data
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl('/products');
  }
}
