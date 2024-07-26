import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { CardComponent, CardData } from '../card/card.component';
import { Player, Team, PlayerService } from '../../services/player.service';
import { BiddingService } from '../../services/bidding.service';
import { GameService, GamePhase } from '../../services/game.service';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { ScoreService } from '../../services/score.service';
import { TrickService } from '../../services/trick.service';

@Component({
  selector: 'app-player-hand',
  templateUrl: './player-hand.component.html',
  styleUrls: ['./player-hand.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatChipsModule, CardComponent, DragDropModule]
})
export class PlayerHandComponent implements OnChanges {
  @Input() player!: Player;
  @Input() isDealer: boolean = false;
  @Input() isBidding: boolean = false;
  @Input() isCurrentPlayer: boolean = false;
  @Input() currentPhase!: GamePhase;
  
  @Output() startNewHandEvent = new EventEmitter<void>();
  @Output() dealCardsEvent = new EventEmitter<void>();
  @Output() redealCardsEvent = new EventEmitter<void>();
  @Output() placeBidEvent = new EventEmitter<number | 'Pass'>();
  @Output() setGoDownEvent = new EventEmitter<CardData[]>();
  @Output() setTrumpEvent = new EventEmitter<string>();
  @Output() cardPlayed = new EventEmitter<CardData>();

  allBids: (number | 'Pass')[] = ['Pass', 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];
  selectedCards: CardData[] = [];
  selectedTrump: string | null = null;
  selectedCard: CardData | null = null;
  revealedCardCount: number = 0;
  revealedCards: boolean[] = [];

  constructor(
    private biddingService: BiddingService, 
    public gameService: GameService, 
    private scoreService: ScoreService,
    private trickService: TrickService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentPhase']) {
      if (this.currentPhase === 'Dealing') {
        // Reset local state when a new hand starts
        this.selectedCards = [];
        this.selectedTrump = null;
        this.selectedCard = null;
        this.player.currentBid = null;
      }
    }
  }

  get tricksTaken(): number {
    return this.trickService.getTrickCounts()[this.player.name] || 0;
  }

  isBiddingStarted(): boolean {
    return this.gameService.isBiddingStarted();
  }

  updateBidState() {
    // This method will be called whenever the player or phase changes
    // It ensures that the bidding state is always up to date
  }

  isBidSelected(bid: number | 'Pass'): boolean {
    // Only return true if the player has actually made this bid
    return this.player.currentBid === bid && this.player.currentBid !== null;
  }

  isValidBid(bid: number | 'Pass'): boolean {
    if (!this.isCurrentPlayer) {
      return true; // All bids appear valid for non-current players
    }
    if (bid === 'Pass') {
      return true; // PASS is always valid for the current player
    }
    return this.biddingService.isValidBid(bid, this.player);
  }

  canBid(bid: number | 'Pass'): boolean {
    return this.isCurrentPlayer && this.isValidBid(bid);
  }

  placeBid(bid: number | 'Pass') {
    if (this.canBid(bid)) {
      this.player.currentBid = bid;
      this.placeBidEvent.emit(bid);
    }
  }

  isBidWinner(): boolean {
    return this.player.name === this.gameService.getGameMetadata().bidWinner;
}

  dealCards() {
    this.startNewHandEvent.emit();
  }

  redealCards() {
    this.redealCardsEvent.emit();
  }

  isCardSelectable(card: CardData): boolean {
    switch (this.currentPhase) {
      case 'SelectingGoDown':
        return this.player.name === this.gameService.getGameMetadata().bidWinner;
      case 'PlayingTricks':
        return this.isCurrentPlayer && this.isCardPlayable(card);
      default:
        return true; // Allow selection in other phases
    }
  }

  isCardSelected(card: CardData): boolean {
    if (this.currentPhase === 'SelectingGoDown') {
      return this.selectedCards.includes(card);
    }
    if (this.currentPhase === 'PlayingTricks') {
      return this.selectedCard === card;
    }
    return false;
  }

  isCardPlayable(card: CardData): boolean {
    if (this.currentPhase !== 'PlayingTricks' || !this.isCurrentPlayer) {
      return true; // All cards are playable outside of PlayingTricks phase
    }
    return this.gameService.isValidPlay(this.player, card);
  }

  handleCardClick(card: CardData): void {
    switch (this.currentPhase) {
      case 'SelectingGoDown':
        if (this.isCardSelectable(card)) {
          this.toggleCardSelection(card);
        }
        break;
      case 'PlayingTricks':
        if (this.isCardPlayable(card)) {
          this.selectCard(card);
        }
        break;
      default:
        this.selectCard(card); // Default behavior for other phases
    }
  }

  toggleCardSelection(card: CardData): void {
    const index = this.selectedCards.findIndex(c => c.suit === card.suit && c.number === card.number);
    if (index > -1) {
      this.selectedCards.splice(index, 1);
    } else if (this.selectedCards.length < 4) {
      this.selectedCards.push(card);
    }
  }

  selectCard(card: CardData) {
    this.selectedCard = this.selectedCard === card ? null : card;
  }

  

  // DRAG AND DROP FEATURE:

  drop(event: CdkDragDrop<CardData[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.player.hand, event.previousIndex, event.currentIndex);
      // Trigger the animation manually
      const item = event.item.element.nativeElement;
      if (item && item.style) {
        item.style.animation = 'none';
        item.offsetHeight; // Trigger reflow
        item.style.animation = '';
      }
    }
  }

  setGoDown() {
    if (this.selectedCards.length === 4) {
      this.setGoDownEvent.emit(this.selectedCards);
      this.selectedCards = [];
    }
  }

  selectTrump(suit: string) {
    this.selectedTrump = suit;
  }

  setTrump() {
    if (this.selectedTrump) {
      this.setTrumpEvent.emit(this.selectedTrump);
      this.selectedTrump = null;
    }
  }

  isTrumpCard(card: CardData): boolean {
    const currentHand = this.gameService.getCurrentHand();
    return currentHand ? card.suit.toLowerCase() === currentHand.trump.toLowerCase() : false;
  }

  playCard() {
    if (this.selectedCard && this.isCurrentPlayer) {
      this.cardPlayed.emit(this.selectedCard);
      this.player.hand = this.player.hand.filter(c => c !== this.selectedCard);
      this.selectedCard = null;
    }
  }
  
  hasVisibleActionButtons(): boolean {
    return (
      (this.isDealer && (this.currentPhase === 'Dealing' || this.currentPhase === 'Bidding')) ||
      (this.currentPhase === 'SelectingGoDown' && this.player.name === this.gameService.getGameMetadata().bidWinner) ||
      (this.isCurrentPlayer && this.currentPhase === 'PlayingTricks')
    );
  }
}
