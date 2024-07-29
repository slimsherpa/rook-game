import { Injectable } from '@angular/core';
import { Player, Team, PlayerService } from './player.service';
import { ScoreService } from './score.service';
import { CardData } from '../components/card/card.component';

export interface TrickPlay {
  player: Player;
  card: CardData;
}

export interface TrickRecap {
  plays: { 
    player: string,
    team: Team,
    card: CardData,
    isTrickWinner: boolean 
  }[];
  winner: string;
  winnerTeam: Team;
  points: number;
}

export interface TrickCounts {
  [playerName: string]: number;
}

@Injectable({
  providedIn: 'root'
})
export class TrickService {
  private currentTrick: TrickPlay[] = [];
  private leadSuit: string | null = null;
  private trickCounts: { [playerName: string]: number } = {};

  constructor(
    private playerService: PlayerService,
    private scoreService: ScoreService
  ) {}
  
  getTrickCounts(): TrickCounts {
    return {...this.trickCounts};
  }

  resetTrickCounts(): void {
    this.trickCounts = {};
  }

  startNewTrick(): void {
    this.currentTrick = [];
    this.leadSuit = null;
  }

  playCard(player: Player, card: CardData): void {
    if (this.currentTrick.length === 0) {
      this.leadSuit = card.suit;
    }
    this.currentTrick.push({ player, card });
  }

  isValidPlay(player: Player, card: CardData): boolean {
    if (this.currentTrick.length === 0) {
      return true;
    }
    
    if (this.leadSuit && player.hand.some(c => c.suit === this.leadSuit)) {
      return card.suit === this.leadSuit;
    }
    
    return true; // Player can play any card if they don't have the lead suit
  }

  resolveTrick(trump: string): TrickRecap {
    let winningPlay = this.currentTrick[0];
  
    for (let play of this.currentTrick) {
      if (play.card.suit === trump && winningPlay.card.suit !== trump) {
        winningPlay = play;
      } else if (play.card.suit === winningPlay.card.suit && play.card.number > winningPlay.card.number) {
        winningPlay = play;
      }
    }
   
    const cards = this.currentTrick.map(play => play.card);
    this.scoreService.updateTrickScore(winningPlay.player, cards);
  
    // Update trick counts
    this.trickCounts[winningPlay.player.name] = (this.trickCounts[winningPlay.player.name] || 0) + 1;

    const currentHand = this.scoreService.getCurrentHand();
    if (!currentHand) {
      throw new Error('Failed to get current hand');
    }

    const lastTrick = currentHand.tricks[currentHand.tricks.length - 1];
    if (!lastTrick) {
      throw new Error('Failed to get last trick score');
    }

    const trickRecap: TrickRecap = {
      plays: this.currentTrick.map(play => ({
        player: play.player.name,
        team: play.player.team,
        card: play.card,
        isTrickWinner: play.player.name === lastTrick.winnerPlayer
      })),
      winner: lastTrick.winnerPlayer,
      winnerTeam: lastTrick.winnerTeam,
      points: lastTrick.points
    };

    return trickRecap;
  }

  getCurrentTrick(): TrickPlay[] {
    return this.currentTrick;
  }

  getTrickSize(): number {
    return this.currentTrick.length;
  }

  // calculateTrickPoints(cards: CardData[]): number {
  //   return this.scoreService.calculateTrickPoints(cards);
  // }
}