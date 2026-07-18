import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ride } from './ride';

describe('Ride', () => {
  let component: Ride;
  let fixture: ComponentFixture<Ride>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ride],
    }).compileComponents();

    fixture = TestBed.createComponent(Ride);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
