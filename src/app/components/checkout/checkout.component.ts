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

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;
  showBillingForm: boolean = true;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countyList: Country[] = [];

  shippingAddessProvinces: Province[] = [];
  billingAddessProvinces: Province[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private formService: FormService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
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
        email: new FormControl('', [
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
      creditCard: this.formBuilder.group({
        cardType: ['', [Validators.required]],
        nameOnCard: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            CustomFormValidators.notOnlyWhiteSpace,
          ],
        ],
        cardNumber: [
          '',
          [Validators.required, Validators.pattern('[0-9]{16}')],
        ],
        securityCode: [
          '',
          [Validators.required, Validators.pattern('[0-9]{3}')],
        ],
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    this.formService
      .getCreditCardMonths(startMonth)
      .subscribe((data) => (this.creditCardMonths = data));

    // populate credit card years
    this.formService
      .getCreditCardYears()
      .subscribe((data) => (this.creditCardYears = data));

    //fetch all countries
    this.handleCountries();

    this.reviewCartDetails();
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

      this.billingAddessProvinces = this.shippingAddessProvinces;
    } else {
      this.billingAddressFormGroup.reset();

      this.billingAddessProvinces = [];
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
        this.shippingAddessProvinces = data;
      } else {
        this.billingAddessProvinces = data;
      }

      //select first item by default
      formGroup?.get('province')?.setValue(data[0]);
    });
  }
  reviewCartDetails() {

    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }
  onSubmit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }
    console.log(this.checkoutFormGroup.get('shippingAddress')?.value);
    console.log(this.checkoutFormGroup.get('billingAddress')?.value);
    console.log(this.checkoutFormGroup.get('customer')?.value);
  }
}
