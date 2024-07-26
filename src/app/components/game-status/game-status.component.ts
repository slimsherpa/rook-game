import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-status">
      <p>Team A: {{ teamAScore }}</p>
      <p>Team B: {{ teamBScore }}</p>
    </div>
  `,
  styles: [`
    .game-status {
      position: fixed;
      top: 100px;
      left: 30px;
      background-color: var(--color-bg-dark);
      border: 1px solid var(--color-accent);
      border-radius: 5px;
      padding: 15px;
      max-width: 400px;
      z-index: 1000;
      text-align: center;
    }
    p {
      margin: 5px 0;
      color: var(--color-accent);
    }
  `]
})
export class GameStatusComponent {
  @Input() teamAScore: number = 0;
  @Input() teamBScore: number = 0;
}