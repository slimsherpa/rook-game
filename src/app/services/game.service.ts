import { Injectable } from '@angular/core';
import { PlayerService, Player, Team } from './player.service';
import { DeckService } from './deck.service';
import { BiddingService } from './bidding.service';
import { ScoreService, GameScore } from './score.service';
import { TrickService, TrickRecap } from './trick.service';
import { CardData } from '../components/card/card.component';


export type GamePhase = 'Dealing' | 'Bidding' | 'SelectingGoDown' | 'SelectingTrump' | 'PlayingTricks' | 'HandRecap' | 'GameOver';
export { TrickRecap } from './trick.service';

interface GameMetadata {
  dealer: string;
  bidWinner: string | null;
  winningBid: number | null;
  trump: string | null;
  currentPlayer: string;
  goDown: CardData[];
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private players: Player[] = [];
  private gameMetadata: GameMetadata = {
    dealer: '',
    bidWinner: null,
    winningBid: null,
    trump: null,
    currentPlayer: '',
    goDown: [],
  };
  private currentPhase: GamePhase = 'Dealing';
  private widow: CardData[] = [];
  private trickNumber: number = 0;
  private playedTricks: TrickRecap[] = [];
  private handNumber: number = 0;
  private biddingStarted: boolean = false;
  
  constructor(
    private playerService: PlayerService,
    private deckService: DeckService,
    private biddingService: BiddingService,
    private scoreService: ScoreService,
    private trickService: TrickService
  ) {}

  initializeGame(): void {
    this.players = this.playerService.initializePlayers();
    this.players[0].isDealer = true;
    this.startNewHand();
  }

  startNewHand() {
    if (this.currentPhase === 'Dealing' || this.currentPhase === 'HandRecap') {
      console.log('Starting new hand');
      this.handNumber++;
      const deck = this.deckService.createDeck();
      this.deckService.shuffleDeck(deck);
      this.playerService.dealCards(this.players, deck);
      this.widow = deck.slice(-4);
      this.currentPhase = 'Bidding';

      const dealer = this.players.find(p => p.isDealer);
      if (dealer) {
        this.scoreService.initializeHand(
          this.handNumber,
          dealer,
          null,
          0,
          ''
        );
      }

      this.trickService.resetTrickCounts();
      this.biddingService.resetBids(this.players);

      this.startBidding();
    }
  }

  private rotateDealer() {
    const currentDealer = this.players.find(p => p.isDealer);
    if (currentDealer) {
      currentDealer.isDealer = false;
      const nextDealerIndex = (this.players.indexOf(currentDealer) + 1) % this.players.length;
      const nextDealer = this.players[nextDealerIndex];
      nextDealer.isDealer = true;
      this.gameMetadata.dealer = nextDealer.name;
    }
  }

  private updateGameState(bidWinner: Player, winningBid: number) {
    this.gameMetadata.bidWinner = bidWinner.name;
    this.gameMetadata.winningBid = winningBid;
    const currentHand = this.scoreService.getCurrentHand();
    if (currentHand) {
      currentHand.bidWinner = bidWinner.name;
      currentHand.winningBid = winningBid;
    }
  }

  startBidding() {
    this.biddingStarted = true;
    const startingPlayerIndex = (this.players.findIndex(p => p.name === this.gameMetadata.dealer) + 1) % this.players.length;
    this.biddingService.startBidding(this.players, startingPlayerIndex);
    this.gameMetadata.currentPlayer = this.biddingService.getCurrentBidder().name;
  }

  isBiddingStarted(): boolean {
    return this.biddingStarted;
  }

  private resolveTrick() {
    if (!this.gameMetadata.trump) {
      throw new Error('Trump is not set');
    }
    const trickRecap = this.trickService.resolveTrick(this.gameMetadata.trump);
    this.playedTricks.push(trickRecap);
    
    this.gameMetadata.currentPlayer = trickRecap.winner;
    
    if (this.playedTricks.length === 9) {
      this.finishHand();
    } else {
      this.trickNumber++;
      this.trickService.startNewTrick();
    }
  }

  private finishHand() {
    this.scoreService.finalizeHandScore();
    this.scoreService.refreshScoreData();

    if (this.scoreService.isGameOver()) {
      this.currentPhase = 'GameOver';
    } else {
      this.currentPhase = 'HandRecap';
    }
  }

  finalizeHandScore(): void {
    this.scoreService.finalizeHandScore();
    // Log the current state (remove this in production)
    console.log('Current game score:', this.scoreService.getTotalGameScore());
  }

  getScoreCard(): GameScore {
    return this.scoreService.getGameScore();
  }

  getGameScore() {
    const gameScore = this.scoreService.getGameScore();
    return gameScore.gameScore;
  }
  
  getCurrentPhase(): GamePhase {
    return this.currentPhase;
  }

  initializePlayers(): Player[] {
    this.players = this.playerService.initializePlayers();
    this.players[0].isDealer = true;
    this.gameMetadata.dealer = this.players[0].name;
    this.currentPhase = 'Dealing';
    return this.players;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getPlayedTricks(): TrickRecap[] {
    return this.playedTricks;
  }

  getGameMetadata() {
    return this.gameMetadata;
  }

  getCurrentPlayer(): string {
    return this.gameMetadata.currentPlayer;
  }

  redealHand() {
    if (this.currentPhase === 'Bidding') {
      console.log('Redealing hand');
      this.currentPhase = 'Dealing';
      this.startNewHand();
    }
  }

  placeBid(player: Player, bid: number | 'Pass') {
    const bidWinner = this.biddingService.placeBid(player, bid);
    if (bidWinner) {
      const winningBid = this.biddingService.getCurrentBid();
      if (winningBid !== null) {
        this.updateGameState(bidWinner, winningBid);
      } else {
        console.error('Winning bid is null');
      }
      this.currentPhase = 'SelectingGoDown';
      this.addWidowToWinnerHand(bidWinner);
    } else {
      this.gameMetadata.currentPlayer = this.biddingService.getCurrentBidder()?.name;
    }
  }

  private addWidowToWinnerHand(bidWinner: Player) {
    bidWinner.hand = [...bidWinner.hand, ...this.widow];
    this.widow = [];
  }

  setGoDown(player: Player, selectedCards: CardData[]) {
    if (this.currentPhase === 'SelectingGoDown' && selectedCards.length === 4) {
      player.hand = player.hand.filter(card => !selectedCards.includes(card));
      this.gameMetadata.goDown = selectedCards;
      
      const goDownPoints = this.trickService.calculateTrickPoints(selectedCards);
      this.scoreService.setGoDownInfo(player, goDownPoints);
      
      this.currentPhase = 'SelectingTrump';
    }
  }

  setTrump(trump: string) {
    if (this.currentPhase === 'SelectingTrump') {
      this.gameMetadata.trump = trump;
      const currentHand = this.scoreService.getCurrentHand();
      if (currentHand) {
        currentHand.trump = trump;
      }
      this.currentPhase = 'PlayingTricks';
      this.startPlayingTricks();
    }
  }

  startPlayingTricks() {
    this.trickNumber = 1;
    this.playedTricks = [];
    const startingPlayerIndex = (this.players.findIndex(p => p.name === this.gameMetadata.dealer) + 1) % 4;
    this.gameMetadata.currentPlayer = this.players[startingPlayerIndex].name;
    this.trickService.startNewTrick();
  }

  playCard(player: Player, card: CardData): boolean {
    if (this.currentPhase !== 'PlayingTricks' || 
        player.name !== this.gameMetadata.currentPlayer ||
        this.trickService.getTrickSize() === 4) {
      console.log('Invalid play attempt:', player.name, this.gameMetadata.currentPlayer);
      return false;
    }
  
    if (!this.trickService.isValidPlay(player, card)) {
      console.log('Invalid card play:', card);
      return false;
    }
  
    console.log('Playing card:', player.name, card);
    this.trickService.playCard(player, card);
    player.hand = player.hand.filter(c => c !== card);
  
    if (this.trickService.getTrickSize() === 4) {
      this.resolveTrick();
      if (this.playedTricks.length === 9) {
        this.currentPhase = 'HandRecap';
      }
    } else {
      this.moveToNextPlayer();
    }
  
    console.log('Current player after play:', this.gameMetadata.currentPlayer);
    return true;
  }

  isValidPlay(player: Player, card: CardData): boolean {
    return this.trickService.isValidPlay(player, card);
  }

  private moveToNextPlayer() {
    const currentPlayerIndex = this.players.findIndex(p => p.name === this.gameMetadata.currentPlayer);
    const nextPlayerIndex = (currentPlayerIndex + 1) % 4;
    this.gameMetadata.currentPlayer = this.players[nextPlayerIndex].name;
    console.log('Moving to next player:', this.gameMetadata.currentPlayer);
  }

  prepareNextHand() {
    this.rotateDealer();
    this.resetHandState();
    this.currentPhase = 'Dealing';
  }

  private resetHandState() {
    this.trickNumber = 0;
    this.playedTricks = [];
    this.players.forEach(p => p.tricksTaken = 0);
    this.gameMetadata.bidWinner = null;
    this.gameMetadata.winningBid = null;
    this.gameMetadata.trump = null;
    this.gameMetadata.goDown = [];
  }

  getCurrentHand() {
    return this.scoreService.getCurrentHand();
  }

  getGoDown(): CardData[] {
    return this.gameMetadata.goDown;
  }

  getTricksTaken(playerName: string): number {
    const trickCounts = this.trickService.getTrickCounts();
    return trickCounts[playerName] || 0;
  }
  
  getCurrentPlayedCard(playerName: string): CardData | null {
    const currentTrick = this.trickService.getCurrentTrick();
    const playedCard = currentTrick.find(play => play.player.name === playerName);
    return playedCard ? playedCard.card : null;
  }
}