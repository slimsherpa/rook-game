import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPlayerViewComponent } from './select-player-view.component';

describe('SelectPlayerViewComponent', () => {
  let component: SelectPlayerViewComponent;
  let fixture: ComponentFixture<SelectPlayerViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectPlayerViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectPlayerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
