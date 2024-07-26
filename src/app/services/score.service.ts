import { Player, Team } from './player.service';
import { CardData } from '../components/card/card.component';
import { Injectable } from '@angular/core';

export interface TrickScore {
  winnerPlayer: string;
  winnerTeam: Team;
  points: number;
  cards: CardData[];
}

export interface HandScore {
  handNumber: number;
  dealer: string;
  bidWinner: string;
  winningBid: number;
  trump: string;
  tricks: TrickScore[];
  tricksCaptured: {
    [playerName: string]: number;
    teamA: number;
    teamB: number;
  };
  goDown: {
    points: number;
    capturedBy: string;
  };
  handScore: {
    teamA: number;
    teamB: number;
  };
  actualPointsA: number;
  actualPointsB: number;
  scoreA: number;
  scoreB: number;
  tricksWonA: number;
  tricksWonB: number;
  finalScoreA: number;
  finalScoreB: number;
  goDownPoints: number;
  goDownCapturedBy: string;
}

export interface GameScore {
  hands: HandScore[];
  currentHandIndex: number;
  gameScore: {
    teamA: number;
    teamB: number;
  };
}

export interface ScoreCardEntry {
  dealer: string;
  bidWinner: string;
  winningBid: number;
  teamAScore: number;
  teamBScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private gameScore: GameScore = {
    hands: [],
    currentHandIndex: -1,
    gameScore: {
      teamA: 0,
      teamB: 0
    }
  };

  initializeHand(handNumber: number, dealer: Player, bidWinner: Player | null, winningBid: number, trump: string): void {
    this.gameScore.hands.push({
      handNumber,
      dealer: dealer.name,
      bidWinner: bidWinner ? bidWinner.name : '',
      winningBid,
      trump,
      tricks: [],
      tricksCaptured: { teamA: 0, teamB: 0 },
      goDown: { points: 0, capturedBy: '' },
      handScore: { teamA: 0, teamB: 0 },
      actualPointsA: 0,
      actualPointsB: 0,
      scoreA: 0,
      scoreB: 0,
      tricksWonA: 0,
      tricksWonB: 0,
      finalScoreA: 0,
      finalScoreB: 0,
      goDownPoints: 0,
      goDownCapturedBy: ''
    });
    this.gameScore.currentHandIndex++;
  }

  updateTrickScore(winnerPlayer: Player, cards: CardData[]): void {
    const currentHand = this.getCurrentHand();
    if (currentHand) {
      const points = this.calculateTrickPoints(cards);
      const trickScore: TrickScore = {
        winnerPlayer: winnerPlayer.name,
        winnerTeam: winnerPlayer.team,
        points,
        cards
      };
      currentHand.tricks.push(trickScore);
      
      // Update tricks captured for the winning player
      if (!currentHand.tricksCaptured[winnerPlayer.name]) {
        currentHand.tricksCaptured[winnerPlayer.name] = 0;
      }
      currentHand.tricksCaptured[winnerPlayer.name]++;

      // Update hand score
      this.updateHandScore(winnerPlayer.team, points);

      // If this is the 9th trick, assign GoDown points
      if (currentHand.tricks.length === 9) {
        this.assignGoDownPoints(winnerPlayer);
      }
    }
  }

  private assignGoDownPoints(winnerPlayer: Player): void {
    const currentHand = this.getCurrentHand();
    if (currentHand && currentHand.goDown.points > 0) {
      currentHand.goDown.capturedBy = winnerPlayer.name;
      this.updateHandScore(winnerPlayer.team, currentHand.goDown.points);
    }
  }

  private updateHandScore(team: Team, points: number): void {
    const currentHand = this.getCurrentHand();
    if (currentHand) {
      if (team === 'A') {
        currentHand.handScore.teamA += points;
      } else {
        currentHand.handScore.teamB += points;
      }
    }
  }

  private calculateTrickPoints(cards: CardData[]): number {
    return cards.reduce((sum, card) => {
      if (card.number === 5) return sum + 5;
      if (card.number === 10 || card.number === 13) return sum + 10;
      return sum;
    }, 0);
  }

  setGoDownInfo(player: Player, points: number): void {
    const currentHand = this.getCurrentHand();
    if (currentHand) {
      currentHand.goDown = { points, capturedBy: '' };
      // We don't update the hand score here anymore, it will be done when the 9th trick is won
    }
  }

  finalizeHandScore(): void {
    const currentHand = this.getCurrentHand();
    if (currentHand) {
      const bidWinnerTeam = this.getTeamForPlayer(currentHand.bidWinner);
      const otherTeam = bidWinnerTeam === 'teamA' ? 'teamB' : 'teamA';

      currentHand.actualPointsA = currentHand.handScore.teamA;
      currentHand.actualPointsB = currentHand.handScore.teamB;

      if (currentHand.handScore[bidWinnerTeam] >= currentHand.winningBid) {
        // Bid winner made their bid
        // No changes needed to handScore
      } else {
        // Bid winner got set
        currentHand.handScore[bidWinnerTeam] = -currentHand.winningBid;
        currentHand.handScore[otherTeam] = currentHand.handScore[otherTeam];
      }

      // Update game score
      this.gameScore.gameScore.teamA += currentHand.handScore.teamA;
      this.gameScore.gameScore.teamB += currentHand.handScore.teamB;

      currentHand.finalScoreA = this.gameScore.gameScore.teamA;
      currentHand.finalScoreB = this.gameScore.gameScore.teamB;
    }
  }

  private getTeamForPlayer(playerName: string): 'teamA' | 'teamB' {
    return playerName.startsWith('A') ? 'teamA' : 'teamB';
  }

  getCurrentHand(): HandScore | undefined {
    return this.gameScore.hands[this.gameScore.currentHandIndex];
  }

  getGameScore(): GameScore {
    return {
      hands: [...this.gameScore.hands],
      currentHandIndex: this.gameScore.currentHandIndex,
      gameScore: { ...this.gameScore.gameScore }
    };
  }

  getCurrentTrickScore(): TrickScore | undefined {
    const currentHand = this.getCurrentHand();
    return currentHand?.tricks[currentHand.tricks.length - 1];
  }

  getTotalPointsCaptured(): { teamA: number, teamB: number } {
    const currentHand = this.getCurrentHand();
    if (!currentHand) return { teamA: 0, teamB: 0 };

    return currentHand.tricks.reduce((total, trick) => {
      total[trick.winnerTeam === 'A' ? 'teamA' : 'teamB'] += trick.points;
      return total;
    }, { teamA: 0, teamB: 0 });
  }

  isGameOver(): boolean {
    const { teamA, teamB } = this.gameScore.gameScore;
    return teamA > 500 || teamA < -250 || teamB > 500 || teamB < -250;
  }

  getScoreCardData(): ScoreCardEntry[] {
    return this.gameScore.hands.map(hand => ({
      dealer: hand.dealer,
      bidWinner: hand.bidWinner,
      winningBid: hand.winningBid,
      teamAScore: hand.handScore.teamA,
      teamBScore: hand.handScore.teamB
    }));
  }

  getTotalGameScore(): { teamA: number, teamB: number } {
    return this.gameScore.gameScore;
  }

  refreshScoreData(): void {
    // This method doesn't need to do anything, it's just a trigger
    // for components to know when to update their view
  }

  

  // Validation methods can be added here if needed

  // For debugging purposes
  logCurrentState(): void {
    console.log('Current Game State:', JSON.stringify(this.gameScore, null, 2));
  }
}