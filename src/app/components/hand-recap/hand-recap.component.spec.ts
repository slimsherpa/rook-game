import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandRecapComponent } from './hand-recap.component';

describe('HandRecapComponent', () => {
  let component: HandRecapComponent;
  let fixture: ComponentFixture<HandRecapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HandRecapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandRecapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
