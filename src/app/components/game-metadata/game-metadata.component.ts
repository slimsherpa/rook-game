import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-game-metadata',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-metadata">
      <p>Dealer: {{ gameMetadata.dealer }}</p>
      <p>Current Bidder: {{ gameMetadata.currentBidder }}</p>
      <p *ngIf="gameMetadata.bidWinner">Bid Winner: {{ gameMetadata.bidWinner }} ({{ gameMetadata.winningBid }} points)</p>
      <p *ngIf="gameMetadata.trump; else noTrump">Trump: {{ gameMetadata.trump }}</p>
      <ng-template #noTrump>
        <p>Trump: Not yet set</p>
      </ng-template>
      <p>Hand Score - Team A: {{ gameMetadata.handScoreA }}</p>
      <p>Hand Score - Team B: {{ gameMetadata.handScoreB }}</p>
    </div>
  `,
  styles: [`
    mat-card {
      margin-bottom: 20px;
    }
  `]
})
export class GameMetadataComponent {
  @Input() gameMetadata: any;
}