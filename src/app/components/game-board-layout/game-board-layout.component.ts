import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { GamePhase } from '../../services/game.service';
import { CommonModule } from '@angular/common';
import { MiniPlayerComponent } from '../mini-player/mini-player.component';
import { Player, Seat } from '../../services/player.service';
import { CardData } from '../../components/card/card.component';

@Component({
  selector: 'app-game-board-layout',
  standalone: true,
  imports: [CommonModule, MiniPlayerComponent],
  template: `
    <div class="game-board-layout">
      <div class="player-selector">
        <button 
          *ngFor="let player of players" 
          (click)="selectPlayer(player.seat)"
          [class.selected]="selectedPlayerSeat === player.seat"
          class="player-button">
          {{ player.name }} ({{ player.seat }})
        </button>
      </div>

      <div class="players-container">
        <div class="top-player">
        <app-mini-player 
            *ngIf="arrangedPlayers[2]"
            [player]="arrangedPlayers[2]" 
            [currentPhase]="currentPhase"
            [isDealer]="isDealerForPlayer(arrangedPlayers[2])"
            [isBidWinner]="arrangedPlayers[2].name === gameMetadata.bidWinner"
            [currentCard]="playedCards[arrangedPlayers[2].name]"
            [tricksTaken]="tricksTaken[arrangedPlayers[2].name]"
            [showHand]="arrangedPlayers[2].seat === selectedPlayerSeat"
            [trump]="getTrump()">
          </app-mini-player>
        </div>
        <div class="middle-players">
          <div class="left-player">
          <app-mini-player 
            *ngIf="arrangedPlayers[1]"
            [player]="arrangedPlayers[1]" 
            [currentPhase]="currentPhase"
            [isDealer]="isDealerForPlayer(arrangedPlayers[1])"
            [isBidWinner]="arrangedPlayers[1].name === gameMetadata.bidWinner"
            [currentCard]="playedCards[arrangedPlayers[1].name]"
            [tricksTaken]="tricksTaken[arrangedPlayers[1].name]"
            [showHand]="arrangedPlayers[1].seat === selectedPlayerSeat"
            [trump]="getTrump()">
          </app-mini-player>
          </div>
          <div class="right-player">
          <app-mini-player 
            *ngIf="arrangedPlayers[3]"
            [player]="arrangedPlayers[3]" 
            [currentPhase]="currentPhase"
            [isDealer]="isDealerForPlayer(arrangedPlayers[3])"
            [isBidWinner]="arrangedPlayers[3].name === gameMetadata.bidWinner"
            [currentCard]="playedCards[arrangedPlayers[3].name]"
            [tricksTaken]="tricksTaken[arrangedPlayers[3].name]"
            [showHand]="arrangedPlayers[3].seat === selectedPlayerSeat"
            [trump]="getTrump()">
          </app-mini-player>
          </div>
        </div>
        <div class="bottom-player">
      <ng-container *ngIf="arrangedPlayers[0]; else noBottomPlayer">
        <app-mini-player 
          [player]="arrangedPlayers[0]" 
          [currentPhase]="currentPhase"
          [isDealer]="isDealerForPlayer(arrangedPlayers[0])"
          [isBidWinner]="arrangedPlayers[0].name === gameMetadata.bidWinner"
          [currentCard]="playedCards[arrangedPlayers[0].name]"
          [tricksTaken]="tricksTaken[arrangedPlayers[0].name]"
          [showHand]="arrangedPlayers[0].seat === selectedPlayerSeat"
          [trump]="getTrump()">
        </app-mini-player>
      </ng-container>
      <ng-template #noBottomPlayer>
        <div>No bottom player available</div>
      </ng-template>
    </div>
  </div>
  `,
  styleUrls: ['./game-board-layout.component.scss']
})
export class GameBoardLayoutComponent implements OnInit {
  @Input() players: Player[] = [];
  @Input() currentPhase: GamePhase = 'Dealing';
  @Input() isDealer: boolean = false;
  @Input() gameMetadata: any;
  @Input() currentPlayer: string = '';
  @Input() playedCards: {[playerName: string]: CardData | null} = {};
  @Input() tricksTaken: {[playerName: string]: number} = {};
  
  @Output() playerSelectedEvent = new EventEmitter<string>();

  selectedPlayerSeat: Seat = 'B2';
  arrangedPlayers: Player[] = [];

  ngOnInit() {
    if (this.players.length > 0) {
      this.arrangePlayersView();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('GameBoardLayout - changes:', changes);
    if (changes['players'] || changes['gameMetadata']) {
      console.log('GameBoardLayout - gameMetadata:', this.gameMetadata);
      console.log('GameBoardLayout - players:', this.players);
      this.arrangePlayersView();
    }
  }

  selectPlayer(seat: Seat) {
    this.selectedPlayerSeat = seat;
    this.arrangePlayersView();
    this.playerSelectedEvent.emit(seat);
  }

  getCurrentCardForPlayer(player: Player): CardData | null {
    return this.playedCards[player.name] || null;
  }

  isDealerForPlayer(player: Player): boolean {
    const isDealer = player.name === this.gameMetadata.dealer;
    console.log(`Is ${player.name} (${player.seat}) dealer?`, isDealer, 'Current dealer:', this.gameMetadata.dealer);
    return isDealer;
  }

  isBidWinnerForPlayer(player: Player): boolean {
    return player.name === this.gameMetadata.bidWinner;
  }

  arrangePlayersView() {
    if (this.players.length === 0) return;

    const selectedPlayer = this.players.find(p => p.seat === this.selectedPlayerSeat) || this.players[0];
    const playerOrder: Seat[] = ['B2', 'A1', 'B1', 'A2'];
    const selectedIndex = playerOrder.indexOf(selectedPlayer.seat);
    
    // Rearrange the order so that the selected player is at the bottom (index 0)
    const rearrangedOrder = [
      ...playerOrder.slice(selectedIndex),
      ...playerOrder.slice(0, selectedIndex)
    ];

    this.arrangedPlayers = rearrangedOrder.map(seat => this.players.find(p => p.seat === seat)!);

    // Ensure that arrangedPlayers always has 4 elements
    while (this.arrangedPlayers.length < 4) {
      this.arrangedPlayers.push(this.players[0]);
    }
  }
  
  getTrump(): string | null {
    return this.gameMetadata.trump || null;
  }
}