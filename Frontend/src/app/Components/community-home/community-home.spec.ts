import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityHome } from './community-home';

describe('CommunityHome', () => {
  let component: CommunityHome;
  let fixture: ComponentFixture<CommunityHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityHome],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunityHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
