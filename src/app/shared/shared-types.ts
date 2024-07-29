// Player and Team types
export type Seat = 'A1' | 'A2' | 'B1' | 'B2';
export type Team = 'A' | 'B';

export interface Player {
  name: string;
  seat: Seat;
  team: Team;
  hand: CardData[];
  isDealer: boolean;
  currentBid: number | 'Pass' | null;
  tricksTaken: number;
  isRevealingCards: boolean;
}

// Card types
export type Suit = 'Red' | 'Yellow' | 'Black' | 'Green';
export type CardNumber = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface CardData {
  suit: Suit;
  number: CardNumber;
  count: number;
}

// Function to calculate card count
export function getCardCount(number: CardNumber): number {
  if (number === 5) return 5;
  if (number === 10 || number === 13) return 10;
  return 0;
}

// Game state types
export type GamePhase = 'Dealing' | 'Bidding' | 'SelectingGoDown' | 'SelectingTrump' | 'PlayingTricks' | 'HandRecap' | 'GameOver';

export interface GameState {
  currentPhase: GamePhase;
  currentPlayer: Player | null;
  dealer: Player | null;
  bidWinner: Player | null;
  winningBid: number | null;
  trump: Suit | null;
  goDown: CardData[];
  handNumber: number;
  trickNumber: number;
}

// Event types
export type GameEventType = 'TrickComplete' | 'HandComplete' | 'GameOver' | 'BidPlaced' | 'TrumpSelected';

export interface GameEvent {
  type: GameEventType;
  data: any;
}

// Scoring types
export interface HandScore {
  handNumber: number;
  dealer: string;
  bidWinner: string;
  winningBid: number;
  trump: Suit;
  teamAPoints: number;
  teamBPoints: number;
  teamAScore: number;
  teamBScore: number;
}

export interface GameScore {
  hands: HandScore[];
  totalScoreA: number;
  totalScoreB: number;
}

// Trick types
export interface PlayedCard {
  player: Player;
  card: CardData;
}

export interface TrickResult {
  winner: Player;
  winningTeam: Team;
  cards: CardData[];
  points: number;
}

// Bidding types
export type BidValue = number | 'Pass' | null;

export interface BidState {
  currentBid: number | null;
  passCount: number;
  bidWinner: Player | null;
  passedPlayers: Set<Player>;
  currentBidderIndex: number;
}

// Constants for bidding
export const VALID_BID_VALUES: BidValue[] = [null, 'Pass', 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];
export const MIN_BID = 65;
export const MAX_BID = 120;
export const PASS_COUNT_TO_END_BIDDING = 3;

// Utility types for bidding
export type BidResult = Player | null;

// Bidding-related functions
export function isValidBid(bid: BidValue, currentBid: number | null): boolean {
  if (bid === 'Pass' || bid === null) return true;
  if (currentBid === null) {
    return bid >= MIN_BID && bid <= MAX_BID;
  }
  return bid > currentBid && bid <= MAX_BID;
}

export function getValidBids(currentBid: number | null): BidValue[] {
  return VALID_BID_VALUES.filter(bid => 
    bid === 'Pass' || bid === null || (typeof bid === 'number' && (currentBid === null || bid > currentBid))
  );
}