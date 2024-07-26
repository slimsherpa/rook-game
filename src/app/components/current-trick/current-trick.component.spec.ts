import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentTrickComponent } from './current-trick.component';

describe('CurrentTrickComponent', () => {
  let component: CurrentTrickComponent;
  let fixture: ComponentFixture<CurrentTrickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentTrickComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentTrickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
