import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardData } from '../card/card.component';
import { GamePhase } from '../../services/game.service';

@Component({
  selector: 'app-go-down',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="godown" *ngIf="shouldBeVisible()">
      <div class="godown-cards">
        <div *ngFor="let card of goDownCards" class="godown-card">
          <app-card [card]="card" [isTrump]="isTrumpCard(card)"></app-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .godown {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: var(--color-bg-dark);
      border: 1px solid var(--color-accent);
      border-radius: 5px;
      padding: 15px;
      z-index: 1000;
    }
    h3 {
      color: var(--color-accent);
      margin-bottom: 10px;
    }
    .godown-cards {
      display: flex;
      gap: 0px;
    }
    .godown-card {
      transform: scale(0.7);
      transform-origin: center center;
    }
  `]
})
export class GoDownComponent {
  @Input() goDownCards: CardData[] = [];
  @Input() isVisible: boolean = false;
  @Input() trump: string = '';
  @Input() currentPhase!: GamePhase;

  shouldBeVisible(): boolean {
    return this.isVisible && 
           (this.currentPhase === 'SelectingTrump' || this.currentPhase === 'PlayingTricks');
  }

  isTrumpCard(card: CardData): boolean {
    return card.suit.toLowerCase() === this.trump.toLowerCase();
  }
}