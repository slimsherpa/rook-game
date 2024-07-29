import { Injectable } from '@angular/core';
import { Player } from './player.service';
import { CardData } from '../components/card/card.component';

export type Team = 'A' | 'B';

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
  isFinalized: boolean;
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
      goDownCapturedBy: '',
      isFinalized: false
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
      
      // Update tricks captured
      const teamKey = winnerPlayer.team === 'A' ? 'teamA' : 'teamB';
      currentHand.tricksCaptured[teamKey]++;
      if (!currentHand.tricksCaptured[winnerPlayer.name]) {
        currentHand.tricksCaptured[winnerPlayer.name] = 0;
      }
      currentHand.tricksCaptured[winnerPlayer.name]++;
  
      // Update hand score
      this.updateHandScore(winnerPlayer.team, points);
  
      console.log('Trick scored:', {
        winnerPlayer: winnerPlayer.name,
        winnerTeam: winnerPlayer.team,
        points,
        cards,
        tricksCaptured: currentHand.tricksCaptured,
        handScore: currentHand.handScore
      });
  
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
      currentHand.goDownPoints = points;
    }
  }

  // finalizeHandScore(): void {
  //   const currentHand = this.getCurrentHand();
  //   if (currentHand && !currentHand.isFinalized) {
  //     const bidWinnerTeam = this.getTeamForPlayer(currentHand.bidWinner);
  //     const otherTeam = bidWinnerTeam === 'teamA' ? 'teamB' : 'teamA';
  
  //     // Calculate actual points for both teams
  //     currentHand.actualPointsA = this.calculateTeamPoints('teamA', currentHand);
  //     currentHand.actualPointsB = this.calculateTeamPoints('teamB', currentHand);
  
  //     const bidWinnerScore = bidWinnerTeam === 'teamA' ? currentHand.actualPointsA : currentHand.actualPointsB;
  //     const otherTeamScore = bidWinnerTeam === 'teamA' ? currentHand.actualPointsB : currentHand.actualPointsA;
  
  //     if (bidWinnerScore >= currentHand.winningBid) {
  //       // Bid winner made their bid
  //       currentHand.scoreA = currentHand.actualPointsA;
  //       currentHand.scoreB = currentHand.actualPointsB;
  //     } else {
  //       // Bid winner got set
  //       if (bidWinnerTeam === 'teamA') {
  //         currentHand.scoreA = -currentHand.winningBid;
  //         currentHand.scoreB = otherTeamScore;
  //       } else {
  //         currentHand.scoreA = otherTeamScore;
  //         currentHand.scoreB = -currentHand.winningBid;
  //       }
  //     }
  
  //     // Update game score
  //     this.gameScore.gameScore.teamA += currentHand.scoreA;
  //     this.gameScore.gameScore.teamB += currentHand.scoreB;
  
  //     currentHand.finalScoreA = this.gameScore.gameScore.teamA;
  //     currentHand.finalScoreB = this.gameScore.gameScore.teamB;
  
  //     currentHand.isFinalized = true;
  
  //     console.log('Hand finalized:', {
  //       handNumber: currentHand.handNumber,
  //       bidWinner: currentHand.bidWinner,
  //       winningBid: currentHand.winningBid,
  //       actualPointsA: currentHand.actualPointsA,
  //       actualPointsB: currentHand.actualPointsB,
  //       scoreA: currentHand.scoreA,
  //       scoreB: currentHand.scoreB,
  //       gameScoreA: this.gameScore.gameScore.teamA,
  //       gameScoreB: this.gameScore.gameScore.teamB
  //     });
  //   }
  // }

  simpleFinalizeHandScore(): void {
    const currentHand = this.getCurrentHand();
    if (currentHand && !currentHand.isFinalized) {
      const bidWinnerTeam = this.getTeamForPlayer(currentHand.bidWinner);
      const otherTeam = bidWinnerTeam === 'teamA' ? 'teamB' : 'teamA';
  
      const bidWinnerScore = this.calculateTeamPoints(bidWinnerTeam, currentHand);
      const otherTeamScore = this.calculateTeamPoints(otherTeam, currentHand);
  
      if (bidWinnerScore >= currentHand.winningBid) {
        // Bid winner made their bid
        currentHand.scoreA = bidWinnerTeam === 'teamA' ? bidWinnerScore : otherTeamScore;
        currentHand.scoreB = bidWinnerTeam === 'teamB' ? bidWinnerScore : otherTeamScore;
      } else {
        // Bid winner got set
        currentHand.scoreA = bidWinnerTeam === 'teamA' ? -currentHand.winningBid : otherTeamScore;
        currentHand.scoreB = bidWinnerTeam === 'teamB' ? -currentHand.winningBid : otherTeamScore;
      }
  
      // Update game score
      this.gameScore.gameScore.teamA += currentHand.scoreA;
      this.gameScore.gameScore.teamB += currentHand.scoreB;
  
      currentHand.actualPointsA = this.calculateTeamPoints('teamA', currentHand);
      currentHand.actualPointsB = this.calculateTeamPoints('teamB', currentHand);
      currentHand.finalScoreA = this.gameScore.gameScore.teamA;
      currentHand.finalScoreB = this.gameScore.gameScore.teamB;
  
      currentHand.isFinalized = true;
  
      console.log('Hand finalized:', {
        handNumber: currentHand.handNumber,
        bidWinner: currentHand.bidWinner,
        winningBid: currentHand.winningBid,
        actualPointsA: currentHand.actualPointsA,
        actualPointsB: currentHand.actualPointsB,
        scoreA: currentHand.scoreA,
        scoreB: currentHand.scoreB,
        gameScoreA: this.gameScore.gameScore.teamA,
        gameScoreB: this.gameScore.gameScore.teamB
      });
    }
  }

  private calculateTeamPoints(team: 'teamA' | 'teamB', hand: HandScore): number {
    const teamLetter = team === 'teamA' ? 'A' : 'B';
    let points = hand.tricks.reduce((sum, trick) => 
      trick.winnerTeam === teamLetter ? sum + trick.points : sum, 0);
    
    // Add 20 points bonus if the team captured 5 or more tricks
    if (hand.tricksCaptured[team] >= 5) {
      points += 20;
    }
  
    // Add go-down points if applicable (only to the team that won the last trick)
    if (hand.tricks.length === 9 && hand.goDown.points > 0) {
      const lastTrickWinner = hand.tricks[8].winnerTeam;
      if (lastTrickWinner === teamLetter) {
        points += hand.goDown.points;
      }
    }
  
    return points;
  }

  
  private getTeamForPlayer(playerName: string): 'teamA' | 'teamB' {
    return playerName.startsWith('A') ? 'teamA' : 'teamB';
  }

  private validateHandScore(hand: HandScore): void {
    const calculatedA = this.calculateTeamPoints('teamA', hand);
    const calculatedB = this.calculateTeamPoints('teamB', hand);
    
    if (calculatedA !== hand.actualPointsA || calculatedB !== hand.actualPointsB) {
      console.error('Score mismatch detected:', {
        calculated: { teamA: calculatedA, teamB: calculatedB },
        actual: { teamA: hand.actualPointsA, teamB: hand.actualPointsB }
      });
    }
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

    return {
      teamA: currentHand.actualPointsA,
      teamB: currentHand.actualPointsB
    };
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
      teamAScore: hand.scoreA,
      teamBScore: hand.scoreB
    }));
  }

  getTotalGameScore(): { teamA: number, teamB: number } {
    return this.gameScore.gameScore;
  }

  refreshScoreData(): void {
    // This method is a trigger for components to update their view
    // It doesn't need to do anything in the service
  }

  // For debugging purposes
  logCurrentState(): void {
    console.log('Current Game State:', JSON.stringify(this.gameScore, null, 2));
  }
}