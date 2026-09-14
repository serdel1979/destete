import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

export interface ChartDetailData {
  title: string;
  hint?: string;
  type: ChartType;
  data: ChartConfiguration['data'];
  options?: ChartConfiguration['options'];
}

@Component({
  selector: 'app-chart-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, BaseChartDirective],
  templateUrl: './chart-detail-dialog.component.html',
  styleUrl: './chart-detail-dialog.component.scss'
})
export class ChartDetailDialogComponent {
  detailOptions: ChartConfiguration['options'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: ChartDetailData) {
    this.detailOptions = {
      ...data.options,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...(data.options?.plugins ?? {}),
        legend: { display: (data.data.datasets?.length ?? 0) > 1 || data.type === 'doughnut' || data.type === 'pie' }
      }
    };
  }
}
