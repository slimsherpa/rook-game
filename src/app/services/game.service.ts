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
    this.players = this.playerService.getPlayers();
    this.playerService.rotateDealer();
    this.startNewHand();
  }

  startNewHand() {
    if (this.currentPhase === 'Dealing' || this.currentPhase === 'HandRecap') {
      this.scoreService.finalizeHandScore(); // Finalize the previous hand if it exists
      const handNumber = this.scoreService.getAllHands().length + 1;
      const deck = this.deckService.createDeck();
      this.deckService.shuffleDeck(deck);
      this.playerService.dealCards(deck);
      this.widow = deck.slice(-4);
      this.currentPhase = 'Bidding';

      const dealer = this.players.find(p => p.isDealer);
      if (dealer) {
        this.scoreService.initializeHand(
          handNumber,
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

  updateTrickScore(winnerPlayer: Player, cards: CardData[]): void {
    const currentHand = this.scoreService.getCurrentHand();
    if (currentHand) {
      this.scoreService.updateTrickScore(winnerPlayer, cards);
      //console.log(`Trick won by ${winnerPlayer.name} (Team ${winnerPlayer.team})`);

      if (currentHand.tricks.length === 9) {
        //console.log(`GoDown captured by ${winnerPlayer.name} (Team ${winnerPlayer.team})`);
      }
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
    if (!this.scoreService.getCurrentHand()?.isFinalized) {
      this.scoreService.finalizeHandScore();
    }
    // Remove the call to refreshScoreData as it no longer exists
  
    if (this.scoreService.isGameOver()) {
      this.currentPhase = 'GameOver';
    } else {
      this.currentPhase = 'HandRecap';
    }
  }

  finalizeHandScore(): void {
    this.scoreService.finalizeHandScore();
    // Use getGameScore instead of getTotalGameScore
    //console.log('Current game score:', this.scoreService.getGameScore().gameScore);
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
    this.players = this.playerService.getPlayers();
    const firstPlayer = this.playerService.getPlayerBySeat('A1');
    if (firstPlayer) {
      firstPlayer.isDealer = true;
      this.gameMetadata.dealer = firstPlayer.name;
    }
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
      
      const goDownPoints = this.scoreService.calculateTrickPoints(selectedCards);
      this.scoreService.setGoDownInfo(player, goDownPoints);
      
      this.currentPhase = 'SelectingTrump';
    }
  }
  
  calculateGoDownPoints(cards: CardData[]): number {
    return this.scoreService.calculateTrickPoints(cards);
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
      return false;
    }
  
    if (!this.trickService.isValidPlay(player, card)) {
      return false;
    }
  
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
  
    return true;
  }

  isValidPlay(player: Player, card: CardData): boolean {
    return this.trickService.isValidPlay(player, card);
  }

  private moveToNextPlayer() {
    const currentPlayerIndex = this.players.findIndex(p => p.name === this.gameMetadata.currentPlayer);
    const nextPlayerIndex = (currentPlayerIndex + 1) % 4;
    this.gameMetadata.currentPlayer = this.players[nextPlayerIndex].name;
  }

  prepareNextHand() {
    this.rotateDealer();
    this.resetCurrentHandState();
    this.currentPhase = 'Dealing';
  }

  private resetCurrentHandState() {
    this.trickNumber = 0;
    this.playedTricks = [];
    this.players.forEach(p => p.tricksTaken = 0);
    this.gameMetadata.bidWinner = null;
    this.gameMetadata.winningBid = null;
    this.gameMetadata.trump = null;
    this.gameMetadata.goDown = [];
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