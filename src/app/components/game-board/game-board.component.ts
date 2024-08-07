import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { GameMetadataComponent } from '../game-metadata/game-metadata.component';
import { CardComponent, CardData } from '../card/card.component';
import { ScoreCardComponent } from '../score-card/score-card.component';
import { PlayerHandComponent } from '../player-hand/player-hand.component';
import { CurrentTrickComponent } from '../current-trick/current-trick.component';
import { HandRecapComponent } from '../hand-recap/hand-recap.component';
import { GameStatusComponent } from '../game-status/game-status.component';
import { HandStatusComponent } from '../hand-status/hand-status.component';
import { GameService, GamePhase, TrickRecap } from '../../services/game.service';
import { PlayerService, Player, Team, Seat } from '../../services/player.service';
import { HandScore, ScoreService, GameScore } from '../../services/score.service';
import { MiniPlayerComponent } from '../mini-player/mini-player.component';
import { GameBoardLayoutComponent } from '../game-board-layout/game-board-layout.component';
import { SelectPlayerViewComponent } from '../select-player-view/select-player-view.component';
import { GoDownComponent } from '../go-down/go-down.component';

type ViewOption = Seat | 'God';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    GameMetadataComponent,
    ScoreCardComponent,
    PlayerHandComponent,
    CurrentTrickComponent,
    GameStatusComponent,
    HandRecapComponent,
    HandStatusComponent,
    MiniPlayerComponent,
    GameBoardLayoutComponent,
    SelectPlayerViewComponent,
    GoDownComponent
  ],
})
export class GameBoardComponent implements OnInit {
  players: Player[] = [];
  gameMetadata: any = {};
  currentPlayer: string = '';
  currentPhase: GamePhase = 'Dealing';
  playedTricks: any[] = [];
  tricks: TrickRecap[] = [];
  goDown: any[] = [];
  goDownCards: CardData[] = []; // I think this is duplicative
  goDownCapturedBy: string = '';
  goDownPoints: number = 0;
  selectedPlayerView: ViewOption = 'A1';

  constructor(
    public gameService: GameService,
    private playerService: PlayerService,
    private scoreService: ScoreService
  ) {}

  ngOnInit() {
    this.initializeGame();
  }

  initializeGame() {
    this.gameService.initializePlayers();
    this.updateGameState();
  }

  onPlayerViewSelected(option: ViewOption) {
    this.selectedPlayerView = option;
  }

  startNewHand() {
    this.gameService.startNewHand();
    this.updateGameState();
  }

  startNextHand() {
    this.gameService.prepareNextHand();
    this.gameService.startNewHand();
    this.updateGameState();
  }

  redealHand() {
    this.gameService.redealHand();
    this.updateGameState();
  }

  placeBid(player: Player, bid: number | 'Pass') {
    this.gameService.placeBid(player, bid);
    this.updateGameState();
  }

  setGoDown(player: Player, selectedCards: any[]) {
    this.gameService.setGoDown(player, selectedCards);
    this.updateGameState();
  }

  setTrump(trump: string) {
    this.gameService.setTrump(trump);
    this.updateGameState();
  }

  onCardPlayed(player: Player, card: any) {
    if (this.gameService.playCard(player, card)) {
      this.updateGameState();
    }
  }

  getGameScore(): { teamA: number; teamB: number } {
    return this.gameService.getGameScore();
  }

  private updateGameState() {
    this.players = this.gameService.getPlayers();
    this.gameMetadata = this.gameService.getGameMetadata();
    this.currentPlayer = this.gameService.getCurrentPlayer();
    this.currentPhase = this.gameService.getCurrentPhase();
    this.playedTricks = this.gameService.getPlayedTricks();
    this.goDown = this.gameService.getGoDown();
    this.tricks = this.gameService.getPlayedTricks();
    
    const currentHand = this.gameService.getCurrentHand();
    if (currentHand) {
      this.goDownCapturedBy = currentHand.goDown.capturedBy || '';
      this.goDownPoints = currentHand.goDown.points || 0;
    }
  }

  getGoDownCapturedBy(): string {
    const currentHand = this.gameService.getCurrentHand();
    return currentHand ? currentHand.goDown.capturedBy : '';
  }

  getGoDownPoints(): number {
    const currentHand = this.gameService.getCurrentHand();
    return currentHand ? currentHand.goDown.points : 0;
  }

  getScoreCard(): GameScore {
    return this.gameService.getScoreCard();
  }

  get lastTrick(): TrickRecap | undefined {
    const playedTricks = this.gameService.getPlayedTricks();
    return playedTricks.length > 0 ? playedTricks[playedTricks.length - 1] : undefined;
  }

  getRunningScore(team: Team, trickIndex: number): number {
    const currentHand = this.gameService.getCurrentHand();
    if (currentHand) {
      return this.scoreService.getRunningScore(team, trickIndex, currentHand);
    }
    return 0;
  }

  isFifthTrickForTeam(trickIndex: number, team: Team): boolean {
    const currentHand = this.gameService.getCurrentHand();
    if (currentHand) {
      return this.scoreService.getTeamTricksCount(team, currentHand, trickIndex + 1) === 5;
    }
    return false;
  }

  onPlayerSelected(playerSeat: string) {
    // Add logic here if needed when a player is selected
  }

  getPlayedCards(): {[playerName: string]: CardData | null} {
    return this.players.reduce((acc: {[playerName: string]: CardData | null}, player) => {
      acc[player.name] = this.gameService.getCurrentPlayedCard(player.name);
      return acc;
    }, {});
  }

  getTricksTakenForAllPlayers(): {[playerName: string]: number} {
    return this.players.reduce((acc: {[playerName: string]: number}, player) => {
      acc[player.name] = this.gameService.getTricksTaken(player.name);
      return acc;
    }, {});
  }

  isGoDownVisible(): boolean {
    return this.selectedPlayerView === 'God' || 
           (this.gameMetadata.bidWinner && 
            this.selectedPlayerView === this.getBidWinnerSeat());
  }

  private getBidWinnerSeat(): Seat | null {
    const bidWinner = this.players.find(player => player.name === this.gameMetadata.bidWinner);
    return bidWinner ? bidWinner.seat : null;
  }
}