import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrumpSelectionComponent } from './trump-selection.component';

describe('TrumpSelectionComponent', () => {
  let component: TrumpSelectionComponent;
  let fixture: ComponentFixture<TrumpSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrumpSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrumpSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
