import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameMetadataComponent } from './game-metadata.component';

describe('GameMetadataComponent', () => {
  let component: GameMetadataComponent;
  let fixture: ComponentFixture<GameMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameMetadataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
