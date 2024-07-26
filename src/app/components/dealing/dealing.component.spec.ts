import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealingComponent } from './dealing.component';

describe('DealingComponent', () => {
  let component: DealingComponent;
  let fixture: ComponentFixture<DealingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
