import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ChartDetailDialogComponent } from './chart-detail-dialog.component';

@Component({
  selector: 'app-mini-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDialogModule, BaseChartDirective],
  templateUrl: './mini-chart.component.html',
  styleUrl: './mini-chart.component.scss'
})
export class MiniChartComponent implements OnChanges {
  @Input({ required: true }) title!: string;
  @Input() hint = '';
  @Input({ required: true }) type!: ChartType;
  @Input({ required: true }) data!: ChartConfiguration['data'];
  @Input() options: ChartConfiguration['options'] = {};

  miniOptions: ChartConfiguration['options'] = {};

  constructor(private dialog: MatDialog) {}

  ngOnChanges(): void {
    const esCircular = this.type === 'doughnut' || this.type === 'pie';
    this.miniOptions = {
      ...this.options,
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        ...(this.options?.plugins ?? {}),
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: esCircular
        ? undefined
        : {
            x: { display: false },
            y: { display: false }
          }
    };
  }

  abrirDetalle(): void {
    this.dialog.open(ChartDetailDialogComponent, {
      data: { title: this.title, hint: this.hint, type: this.type, data: this.data, options: this.options },
      width: 'min(720px, 95vw)'
    });
  }
}
