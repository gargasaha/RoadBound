import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommunity } from './add-community';

describe('AddCommunity', () => {
  let component: AddCommunity;
  let fixture: ComponentFixture<AddCommunity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCommunity],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCommunity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
