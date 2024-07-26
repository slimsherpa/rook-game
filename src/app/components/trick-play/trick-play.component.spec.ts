import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrickPlayComponent } from './trick-play.component';

describe('TrickPlayComponent', () => {
  let component: TrickPlayComponent;
  let fixture: ComponentFixture<TrickPlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrickPlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrickPlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
