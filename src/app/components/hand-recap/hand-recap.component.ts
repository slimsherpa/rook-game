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
      this.handScore.handScore.teamA = this.getTeamScore('A');
      this.handScore.handScore.teamB = this.getTeamScore('B');
    }
  }

  getTeamTricks(team: 'A' | 'B'): number {
    if (!this.handScore) return 0;
    return Object.entries(this.handScore.tricksCaptured)
      .filter(([playerName, _]) => this.playerService.getTeamForPlayer(playerName) === team)
      .reduce((sum, [_, tricks]) => sum + tricks, 0);
  }

  getFinalTeamScore(team: 'A' | 'B'): number {
    if (!this.handScore) return 0;
    const score = this.getTeamScore(team);
    const bidWinnerTeam = this.playerService.getTeamForPlayer(this.handScore.bidWinner);
    if (team === bidWinnerTeam && score < this.handScore.winningBid) {
      return -this.handScore.winningBid;
    }
    return score;
  }

  isBidWinnerSet(): boolean {
    if (!this.handScore) return false;
    const bidWinnerTeam = this.playerService.getTeamForPlayer(this.handScore.bidWinner);
    return this.getTeamScore(bidWinnerTeam) < this.handScore.winningBid;
  }

  formatScore(score: number): string {
    return score >= 0 ? `+${score}` : `${score}`;
  }

  shouldShowGoDown(): boolean {
    if (!this.handScore || !this.goDown) return false;
    return this.goDown.length > 0 && this.handScore.goDown.points > 0;
  }

  isTrumpCard(card: CardData): boolean {
    return this.handScore ? card.suit.toLowerCase() === this.handScore.trump.toLowerCase() : false;
  }

  getRunningScore(team: Team, trickIndex: number): number {
    let score = this.tricks.slice(0, trickIndex + 1).reduce((sum, trick) => {
      if (trick.winnerTeam === team) {
        return sum + trick.points;
      }
      return sum;
    }, 0);
  
    // Add 20 points bonus if this team has won 5 or more tricks
    const teamTricks = this.tricks.slice(0, trickIndex + 1).filter(trick => trick.winnerTeam === team).length;
    if (teamTricks >= 5) {
      score += 20;
    }
  
    return score;
  }

  isGoDownCaptured(): boolean {
    return this.tricks.length === 9 && !!this.handScore?.goDown.capturedBy;
  }

  getGoDownWinner(): string {
    return this.handScore?.goDown.capturedBy || '';
  }

  getGoDownWinnerTeam(): Team {
    const winner = this.getGoDownWinner();
    return this.playerService.getTeamForPlayer(winner);
  }

  getTeamScore(team: 'A' | 'B'): number {
    if (!this.handScore) return 0;
    const trickPoints = this.tricks.reduce((sum, trick) => 
      trick.winnerTeam === team ? sum + trick.points : sum, 0);
    const goDownPoints = this.isGoDownCaptured() && this.getGoDownWinnerTeam() === team ? this.handScore.goDown.points : 0;
    const majorityBonus = this.getTeamTricks(team) >= 5 ? 20 : 0;
    return trickPoints + goDownPoints + majorityBonus;
  }

  getMajorityTrickWinner(): 'A' | 'B' | null {
    if (!this.handScore || this.tricks.length < 9) return null;
    return this.getTeamTricks('A') > 4 ? 'A' : 'B';
  }

  isFifthTrickForTeam(trickIndex: number, team: 'A' | 'B'): boolean {
    const teamTricks = this.tricks.slice(0, trickIndex + 1).filter(trick => trick.winnerTeam === team).length;
    return teamTricks === 5;
  }

  getConclusionMessage(): string {
    if (!this.handScore) return '';
  
    const bidWinnerTeam = this.playerService.getTeamForPlayer(this.handScore.bidWinner);
    const otherTeam = bidWinnerTeam === 'A' ? 'B' : 'A';
    const bidWinnerScore = this.getTeamScore(bidWinnerTeam);
    const otherTeamScore = this.getTeamScore(otherTeam);
  
    if (bidWinnerScore >= this.handScore.winningBid) {
      return `Team ${bidWinnerTeam} made it! They captured ${bidWinnerScore} points on a ${this.handScore.winningBid} bid.\n` +
             `Team ${otherTeam} got ${otherTeamScore} points.`;
    } else {
      return `Team ${bidWinnerTeam} got set! They go back ${this.handScore.winningBid} points.\n` +
             `Team ${otherTeam} got ${otherTeamScore} points.`;
    }
  }

}