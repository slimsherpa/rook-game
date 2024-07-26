import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoDownComponent } from './go-down.component';

describe('GoDownComponent', () => {
  let component: GoDownComponent;
  let fixture: ComponentFixture<GoDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoDownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
