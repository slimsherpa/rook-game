import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreService, HandScore, GameScore } from '../../services/score.service';
import { PlayerService, Team } from '../../services/player.service';

@Component({
  selector: 'app-score-card',
  templateUrl: './score-card.component.html',
  styleUrls: ['./score-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ScoreCardComponent implements OnChanges {
  @Input() gameScore!: GameScore;
  
  displayedHands: HandScore[] = [];

  constructor(
    private scoreService: ScoreService,
    private playerService: PlayerService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gameScore']) {
      this.updateDisplayedHands();
    }
  }

  private updateDisplayedHands() {
    this.displayedHands = this.scoreService.getAllHands();
  }

  formatScore(score: number): string {
    return score >= 0 ? `+${score}` : `${score}`;
  }

  getHandScoreForTeam(team: Team, hand: HandScore): number {
    return this.scoreService.getHandScoreForTeam(team, hand);
  }

  isBidWinner(hand: HandScore, team: Team): boolean {
    return this.playerService.getTeamForPlayer(hand.bidWinner) === team;
  }

  getTotalScore(team: Team): number {
    return this.gameScore.gameScore[team === 'A' ? 'teamA' : 'teamB'];
  }
}