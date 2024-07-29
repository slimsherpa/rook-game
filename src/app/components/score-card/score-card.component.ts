import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameScore, HandScore } from '../../services/score.service';

@Component({
  selector: 'app-score-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-card.component.html',
  styleUrls: ['./score-card.component.scss']
})
export class ScoreCardComponent implements OnChanges {
  @Input() gameScore!: GameScore;
  
  displayedHands: (HandScore & { handNumber: number })[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gameScore']) {
      this.updateDisplayedHands();
    }
  }

  private updateDisplayedHands() {
    this.displayedHands = this.gameScore.hands.map((hand, index) => ({
      ...hand,
      handNumber: index + 1
    }));
  }

  formatScore(score: number): string {
    return score >= 0 ? `+${score}` : `${score}`;
  }

  getTeamScore(hand: HandScore, team: 'teamA' | 'teamB'): string {
    const actualPoints = team === 'teamA' ? hand.actualPointsA : hand.actualPointsB;
    const finalScore = team === 'teamA' ? hand.scoreA : hand.scoreB;
    
    if (actualPoints !== finalScore) {
      return `${this.formatScore(actualPoints)} (${this.formatScore(finalScore)})`;
    }
    return this.formatScore(actualPoints);
  }

  isBidWinner(hand: HandScore, team: 'teamA' | 'teamB'): boolean {
    return this.getTeamForPlayer(hand.bidWinner) === team;
  }

  private getTeamForPlayer(playerName: string): 'teamA' | 'teamB' {
    return playerName.startsWith('A') ? 'teamA' : 'teamB';
  }
}