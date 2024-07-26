import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandStatusComponent } from './hand-status.component';

describe('HandStatusComponent', () => {
  let component: HandStatusComponent;
  let fixture: ComponentFixture<HandStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HandStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
