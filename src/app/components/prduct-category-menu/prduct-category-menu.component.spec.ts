import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrductCategoryMenuComponent } from './prduct-category-menu.component';

describe('PrductCategoryMenuComponent', () => {
  let component: PrductCategoryMenuComponent;
  let fixture: ComponentFixture<PrductCategoryMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrductCategoryMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrductCategoryMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
