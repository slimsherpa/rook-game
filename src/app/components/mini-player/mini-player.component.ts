import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Player } from '../../services/player.service';
import { CardComponent, CardData } from '../card/card.component';
import { GameService, GamePhase } from '../../services/game.service';

@Component({
  selector: 'app-mini-player',
  standalone: true,
  imports: [CommonModule, MatCardModule, CardComponent],
  template: `
    <div class="mini-player-hand" [class.current-player]="isCurrentPlayer">
      <div class="player-info">
        <div class="name-and-indicators">
          <h2 class="player-name">{{ player.name }} ({{ player.seat }})</h2>
          <div class="indicators">
            <span *ngIf="isDealer" class="dealer-indicator">DEALER</span>
            <span *ngIf="isBidWinner" class="bid-winner-indicator">{{ displayBid }}</span>
          </div>
          <div *ngIf="tricksTaken > 0" class="tricks-indicator">
            <span class="material-symbols-outlined upside-down">playing_cards</span> × {{ tricksTaken }}
          </div>
        </div>
        <div class="card-or-bid" [ngClass]="{'no-border': currentPhase === 'Bidding' || currentCard}">
          <app-card *ngIf="currentCard && currentPhase !== 'Bidding'" [card]="currentCard" [isTrump]="isTrumpCard(currentCard)"></app-card>
          <div *ngIf="currentPhase === 'Bidding'" class="current-bid" [class.pass]="player.currentBid === 'Pass'">
            {{ player.currentBid || '-' }}
          </div>
          <div *ngIf="!currentCard && currentPhase !== 'Bidding'" class="card-placeholder"></div>
        </div>
      </div>
    </div>
  `,

  styleUrls: ['./mini-player.component.scss']
})
export class MiniPlayerComponent {
  @Input() player!: Player;
  @Input() currentPhase!: GamePhase;
  @Input() isDealer: boolean = false;
  @Input() isBidWinner: boolean = false;
  @Input() currentCard: CardData | null = null;
  @Input() tricksTaken: number = 0;
  @Input() showHand: boolean = false;
  @Input() trump: string | null = null;
  @Input() isCurrentPlayer: boolean = false;
  
  ngOnChanges(changes: SimpleChanges) {
  }

  get displayBid(): string | null {
    return this.isBidWinner ? this.player.currentBid?.toString() || null : null;
  }

  isTrumpCard(card: CardData): boolean {
    return this.trump !== null && card.suit.toLowerCase() === this.trump.toLowerCase();
  }
}