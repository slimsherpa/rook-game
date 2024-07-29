import { Injectable } from '@angular/core';
import { Player, Team, PlayerService } from './player.service';
import { CardData } from '../components/card/card.component';
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
  goDown: { 
    points: number; 
    capturedBy: string;
   };
  mosttricksTeam: Team; //team that captured the most tricks
  capturedPoints: { // this includes from cards and the 20 points for most tricks. Between the two teams, it should ALWAYS equal 120.
    teamA: number;
    teamB: number;
  };
  handScore: { // this is the score that will be reported for that hand. It considers if the bidwinning team got set or not.
    teamA: number; 
    teamB: number;
  };
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

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private gameScore: GameScore = {
    hands: [],
    currentHandIndex: -1,
    gameScore: { teamA: 0, teamB: 0 }
  };

  constructor(private playerService: PlayerService) {}

  getTeamForPlayer(playerName: string): Team {
    return this.playerService.getTeamForPlayer(playerName);
  }

  initializeHand(handNumber: number, dealer: Player, bidWinner: Player | null, winningBid: number, trump: string): void {
    const newHand: HandScore = {
      handNumber,
      dealer: dealer.name,
      bidWinner: bidWinner ? bidWinner.name : '',
      winningBid,
      trump,
      tricks: [],
      goDown: { points: 0, capturedBy: '' },
      mosttricksTeam: 'A',
      capturedPoints: { teamA: 0, teamB: 0 },
      handScore: { teamA: 0, teamB: 0 },
      isFinalized: false
    };
    this.gameScore.hands.push(newHand);
    this.gameScore.currentHandIndex++;
  }

  getCurrentHand(): HandScore | undefined {
    return this.gameScore.hands[this.gameScore.currentHandIndex];
  }

  setGoDownInfo(player: Player, points: number): void {
    const currentHand = this.getCurrentHand();
    if (currentHand) {
      currentHand.goDown = { points, capturedBy: '' };
    }
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
  
      // Check if this is the 9th trick and assign GoDown
      if (currentHand.tricks.length === 9) {
        currentHand.goDown.capturedBy = winnerPlayer.name;
        //console.log(`GoDown captured by ${winnerPlayer.name} (Team ${winnerPlayer.team})`);
      }
  
      this.updateHandScore(currentHand);
    }
  }

  calculateTrickPoints(cards: CardData[]): number {
    return cards.reduce((sum, card) => {
      if (card.number === 5) return sum + 5;
      if (card.number === 10 || card.number === 13) return sum + 10;
      return sum;
    }, 0);
  }

  getTeamTricksCount(team: Team, hand: HandScore, upToTrick?: number): number {
    const tricksToConsider = upToTrick ? hand.tricks.slice(0, upToTrick) : hand.tricks;
    return tricksToConsider.filter(trick => trick.winnerTeam === team).length;
  }

  private updateHandScore(hand: HandScore): void {
    hand.capturedPoints.teamA = this.calculateCapturedPoints('A', hand);
    hand.capturedPoints.teamB = this.calculateCapturedPoints('B', hand);
    hand.mosttricksTeam = this.determineMostTricksTeam(hand);
    this.calculateFinalHandScore(hand);
  }

  private calculateCapturedPoints(team: Team, hand: HandScore): number {
    const trickPoints = hand.tricks.reduce((sum, trick) => 
      trick.winnerTeam === team ? sum + trick.points : sum, 0);
    
    const goDownPoints = (hand.goDown.capturedBy && this.playerService.getTeamForPlayer(hand.goDown.capturedBy) === team) 
      ? hand.goDown.points 
      : 0;
  
    const majorityBonus = this.getTeamTricksCount(team, hand) > 4 ? 20 : 0;
    
    const total = trickPoints + goDownPoints + majorityBonus;
    
    // console.log(`Captured points for Team ${team}:`, {
    //   trickPoints,
    //   goDownPoints,
    //   majorityBonus,
    //   total,
    //   goDownCapturedBy: hand.goDown.capturedBy
   // })
  ;
  
    return total;
  }

  private determineMostTricksTeam(hand: HandScore): Team {
    return this.getTeamTricksCount('A', hand) > 4 ? 'A' : 'B';
  }

  private calculateFinalHandScore(hand: HandScore): void {
    const bidWinnerTeam = this.playerService.getTeamForPlayer(hand.bidWinner);
    const bidWinnerScore = hand.capturedPoints[bidWinnerTeam === 'A' ? 'teamA' : 'teamB'];
  
    if (bidWinnerScore >= hand.winningBid) {
      hand.handScore.teamA = hand.capturedPoints.teamA;
      hand.handScore.teamB = hand.capturedPoints.teamB;
    } else {
      if (bidWinnerTeam === 'A') {
        hand.handScore.teamA = -hand.winningBid;
        hand.handScore.teamB = hand.capturedPoints.teamB;
      } else {
        hand.handScore.teamA = hand.capturedPoints.teamA;
        hand.handScore.teamB = -hand.winningBid;
      }
    }
  
    // console.log(`Final hand score:`, {
    //   teamA: hand.handScore.teamA,
    //   teamB: hand.handScore.teamB
    // })
    ;
  }

  getRunningScore(team: Team, trickIndex: number, hand: HandScore): number {
    const playedTricks = hand.tricks.slice(0, trickIndex + 1);
    let score = playedTricks.reduce((sum, trick) => 
      trick.winnerTeam === team ? sum + trick.points : sum, 0);

    if (this.getTeamTricksCount(team, hand, trickIndex + 1) >= 5) {
      score += 20;
    }

    return score;
  }

  getCapturedPointsForTeam(team: Team, hand: HandScore): number {
    return hand.capturedPoints[team === 'A' ? 'teamA' : 'teamB'];
  }

  isBidWinnerSet(hand: HandScore): boolean {
    const bidWinnerTeam = this.getTeamForPlayer(hand.bidWinner);
    return hand.capturedPoints[bidWinnerTeam === 'A' ? 'teamA' : 'teamB'] < hand.winningBid;
  }

  finalizeHandScore(): void {
    const currentHand = this.getCurrentHand();
    if (currentHand && !currentHand.isFinalized) {
      this.updateHandScore(currentHand);
      
      // Update the game score
      this.gameScore.gameScore.teamA += currentHand.handScore.teamA;
      this.gameScore.gameScore.teamB += currentHand.handScore.teamB;
      
      currentHand.isFinalized = true;
    }
  }

  resetCurrentHand(): void {
    const currentHand = this.getCurrentHand();
    if (currentHand) {
      currentHand.tricks = [];
      currentHand.goDown = { points: 0, capturedBy: '' };
      currentHand.mosttricksTeam = 'A';
      currentHand.capturedPoints = { teamA: 0, teamB: 0 };
      currentHand.handScore = { teamA: 0, teamB: 0 };
      currentHand.isFinalized = false;
      //console.log(`Hand ${currentHand.handNumber} reset:`, JSON.stringify(currentHand, null, 2));
    }
  }

  prepareNewHand(): void {
    this.gameScore.currentHandIndex++;
  }

  getCurrentHandNumber(): number {
    return this.gameScore.currentHandIndex + 1;
  }

  getAllHands(): HandScore[] {
    return this.gameScore.hands;
  }

  getHandScoreForTeam(team: Team, hand: HandScore): number {
    return hand.handScore[team === 'A' ? 'teamA' : 'teamB'];
  }

  getGameScore(): GameScore {
    return {
      hands: [...this.gameScore.hands],
      currentHandIndex: this.gameScore.currentHandIndex,
      gameScore: { ...this.gameScore.gameScore }
    };
  }

  isGameOver(): boolean {
    const { teamA, teamB } = this.gameScore.gameScore;
    return teamA > 500 || teamA < -250 || teamB > 500 || teamB < -250;
  }
}