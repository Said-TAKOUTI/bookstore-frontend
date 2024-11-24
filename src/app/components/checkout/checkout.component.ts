import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormService } from '../../services/form.service';
import { Country } from '../../common/country';
import { Province } from '../../common/province';

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
    private formService: FormService
  ) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: [''],
      }),
      shippingAddress: this.formBuilder.group({
        country: [''],
        street: [''],
        city: [''],
        province: [''],
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        country: [''],
        street: [''],
        city: [''],
        province: [''],
        zipCode: [''],
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    this.formService.getCreditCardMonths(startMonth).subscribe(
      data => this.creditCardMonths = data
    );

    // populate credit card years
    this.formService.getCreditCardYears().subscribe(
      data => this.creditCardYears = data
    );

    //fetch all countries
    this.handleCountries()
  }

  // Getters
  get shippingAddressFormGroup(): FormGroup {
    return this.checkoutFormGroup.get('shippingAddress') as FormGroup;
  }

  get billingAddressFormGroup(): FormGroup {
    return this.checkoutFormGroup.get('billingAddress') as FormGroup;
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

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard') as FormGroup;

    const currentYear = new Date().getFullYear();
    const selectedYear = Number(creditCardFormGroup.value.expirationYear);

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.formService.getCreditCardMonths(startMonth).subscribe(
      data => this.creditCardMonths = data
    );
  }
  handleCountries() {
    this.formService.getCountries().subscribe(
      data => this.countyList = data
    );
  }

  getProvinces(formGroupName: string) {

    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;

    this.formService.getProvinces(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddessProvinces = data;
        } else {
          this.billingAddessProvinces = data;
        }

        //select first item by default
        formGroup?.get('province')?.setValue(data[0]);
      }
    )

  }
  onSubmit() {
    console.log(this.checkoutFormGroup.get('shippingAddress')?.value);
    console.log(this.checkoutFormGroup.get('billingAddress')?.value);
    console.log(this.checkoutFormGroup.get('customer')?.value);
  }
}
