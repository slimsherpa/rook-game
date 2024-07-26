import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <header class="cyberpunk-header">
      <h1 class="title">Rook</h1>
    </header>
    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');

    :host {
      display: block;
      background-color: var(--color-bg-dark);
      min-height: 100vh;
    }

    .cyberpunk-header {
      background-color: rgba(var(--color-bg-light-rgb), 0.8);
      backdrop-filter: blur(5px);
      padding: 10px 20px;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(var(--color-accent-rgb), 0.3);
    }

    .title {
      font-family: 'Orbitron', sans-serif;
      font-size: 48px;
      font-weight: 700;
      color: var(--color-accent);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(var(--color-accent-rgb), 0.7);
    }

    .content {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {
  title = 'Rook';
}