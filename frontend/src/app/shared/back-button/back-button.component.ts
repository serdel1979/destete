import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-button class="back-button" (click)="location.back()">
      <mat-icon>arrow_back</mat-icon>
      Volver
    </button>
  `,
  styles: [
    `
      .back-button {
        margin-bottom: 8px;
      }
    `
  ]
})
export class BackButtonComponent {
  constructor(public location: Location) {}
}
