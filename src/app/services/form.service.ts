import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Country } from '../common/country';
import { Province } from '../common/province';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  private countriesUrl = "http://localhost:8080/api/countries";
  private provincesUrl = "http://localhost:8080/api/provinces";

  constructor(private httpClient: HttpClient) { }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];

    // build an Array for "Months" dropdown list
    // start at current month and loop until 12

    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
    return of(data);
  }

  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];

    // build an Array for "Years" dropdown list
    // start at current month and loop for the next 10 years 

    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;
    for (let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }
    return of(data);
  }

  getCountries(): Observable<Country[]> {

    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    );
  }

  getProvinces(theCountryCode: string): Observable<Province[]> {

    const searchProvinceUrl = `${this.provincesUrl}/search/findByCountryCode?code=${theCountryCode}`;

    return this.httpClient.get<GetResponseProvinces>(searchProvinceUrl).pipe(
      map(response => response._embedded.provinces)
    );
  }
}
interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  }
}
interface GetResponseProvinces {
  _embedded: {
    provinces: Province[];
  }
}