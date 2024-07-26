import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameBoardLayoutComponent } from './game-board-layout.component';

describe('GameBoardLayoutComponent', () => {
  let component: GameBoardLayoutComponent;
  let fixture: ComponentFixture<GameBoardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBoardLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameBoardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
