import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { TrickService } from '../../services/trick.service';

@Component({
  selector: 'app-current-trick',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="current-trick">
      <div *ngFor="let play of currentTrick" class="played-card">
        <app-card [card]="play.card"></app-card>
        <div>{{ play.player.name }}</div>
      </div>
    </div>
  `,
  styles: [`
    .current-trick {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
    }
    .played-card {
      text-align: center;
    }
  `]
})
export class CurrentTrickComponent {
  constructor(private trickService: TrickService) {}

  get currentTrick() {
    return this.trickService.getCurrentTrick() || [];
  }
}