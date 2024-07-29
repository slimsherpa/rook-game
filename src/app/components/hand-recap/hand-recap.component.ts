import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CardComponent, CardData } from '../card/card.component';
import { HandScore, ScoreService, GameScore } from '../../services/score.service';
import { Player, Team, PlayerService } from '../../services/player.service';
import { GameService, TrickRecap } from '../../services/game.service';

@Component({
  selector: 'app-hand-recap',
  templateUrl: './hand-recap.component.html',
  styleUrls: ['./hand-recap.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, CardComponent],
})
export class HandRecapComponent implements OnChanges {
  @Input() tricks: TrickRecap[] = [];
  @Input() goDown: CardData[] = [];
  @Input() handScore?: HandScore;
  @Input() gameScore!: GameScore;

  constructor(
    private scoreService: ScoreService,
    public playerService: PlayerService,
    private gameService: GameService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tricks'] || changes['handScore']) {
      this.updateRunningScores();
    }
  }

  updateRunningScores() {
    if (this.handScore) {
      this.handScore.handScore.teamA = this.scoreService.getHandScoreForTeam('A', this.handScore);
      this.handScore.handScore.teamB = this.scoreService.getHandScoreForTeam('B', this.handScore);
    }
  }

  getTeamCapturedPoints(team: 'A' | 'B'): number {
    return this.handScore ? this.scoreService.getCapturedPointsForTeam(team, this.handScore) : 0;
  }

  getFinalTeamScore(team: 'A' | 'B'): number {
    return this.handScore ? this.scoreService.getHandScoreForTeam(team, this.handScore) : 0;
  }

  getTeamTricks(team: 'A' | 'B'): number {
    return this.handScore ? this.scoreService.getTeamTricksCount(team, this.handScore) : 0;
  }

  isBidWinnerSet(): boolean {
    return this.handScore ? this.scoreService.isBidWinnerSet(this.handScore) : false;
  }

  shouldShowGoDown(): boolean {
    if (!this.handScore || !this.goDown) return false;
    return this.goDown.length > 0 && this.handScore.goDown.points > 0;
  }

  isTrumpCard(card: CardData): boolean {
    return this.handScore ? card.suit.toLowerCase() === this.handScore.trump.toLowerCase() : false;
  }

  getRunningScore(team: Team, trickIndex: number): number {
    return this.handScore ? this.scoreService.getRunningScore(team, trickIndex, this.handScore) : 0;
  }

  isGoDownCaptured(): boolean {
    return this.tricks.length === 9 && !!this.handScore?.goDown.capturedBy;
  }

  getGoDownWinner(): string {
    return this.handScore?.goDown.capturedBy || '';
  }

  getGoDownWinnerTeam(): Team {
    const winner = this.getGoDownWinner();
    // If winner is a seat, use it directly; otherwise, try to find the player
    return this.playerService.getTeamForPlayer(winner);
  }

  getMajorityTrickWinner(): 'A' | 'B' | null {
    return this.handScore ? this.handScore.mosttricksTeam : null;
  }

  isFifthTrickForTeam(trickIndex: number, team: Team): boolean {
    const currentHand = this.gameService.getCurrentHand();
    if (currentHand) {
      return this.scoreService.getTeamTricksCount(team, currentHand, trickIndex + 1) === 5;
    }
    return false;
  }

  getConclusionMessage(): string {
    if (!this.handScore) return '';
  
    const bidWinnerTeam = this.playerService.getTeamForPlayer(this.handScore.bidWinner);
    const otherTeam = bidWinnerTeam === 'A' ? 'B' : 'A';
    const bidWinnerScore = this.getTeamCapturedPoints(bidWinnerTeam);
    const otherTeamScore = this.getTeamCapturedPoints(otherTeam);
  
    if (bidWinnerScore >= this.handScore.winningBid) {
      return `Team ${bidWinnerTeam} made it! They captured ${bidWinnerScore} points on a ${this.handScore.winningBid} bid.\n` +
             `Team ${otherTeam} got ${otherTeamScore} points.`;
    } else {
      return `Team ${bidWinnerTeam} got set! They go back ${this.handScore.winningBid} points.\n` +
             `Team ${otherTeam} got ${otherTeamScore} points.`;
    }
  }
}