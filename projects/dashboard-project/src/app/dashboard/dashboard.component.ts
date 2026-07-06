import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideNavComponent } from 'shared';
import { AgCharts } from 'ag-charts-angular';
import { AgGridAngular } from 'ag-grid-angular';
import { AgChartOptions, ModuleRegistry as ChartModuleRegistry, AllCommunityModule as ChartAllCommunityModule } from 'ag-charts-community';
import { ColDef, ModuleRegistry as GridModuleRegistry, AllCommunityModule as GridAllCommunityModule } from 'ag-grid-community';
import { DashboardService, DashboardSummary, NutritionSummary, DashboardTask, WeightTrendPoint } from './dashboard.service';

ChartModuleRegistry.registerModules([ChartAllCommunityModule]);
GridModuleRegistry.registerModules([GridAllCommunityModule]);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent, AgCharts, AgGridAngular],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private service = inject(DashboardService);

  summary = signal<DashboardSummary | null>(null);
  nutrition = signal<NutritionSummary | null>(null);
  tasks = signal<DashboardTask[]>([]);
  weightTrend = signal<WeightTrendPoint[]>([]);

  trendChartOptions = signal<AgChartOptions>({
    data: [],
    series: [{
      type: 'line',
      xKey: 'day',
      yKey: 'weight',
      stroke: '#006d43',
      marker: {
        fill: '#006d43',
        stroke: '#006d43'
      }
    }],
    background: {
      fill: 'transparent'
    }
  });

  nutritionChartOptions = signal<AgChartOptions>({
    data: [
      { category: 'Protein', value: 30 },
      { category: 'Carbs', value: 45 },
      { category: 'Fat', value: 25 }
    ],
    series: [{
      type: 'pie',
      angleKey: 'value',
      legendItemKey: 'category',
      fills: ['#006d43', '#5c6561', '#d9e2dd'],
      strokes: ['transparent', 'transparent', 'transparent']
    }],
    background: {
      fill: 'transparent'
    }
  });

  logColumnDefs: ColDef[] = [
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'weight', headerName: 'Weight (kg)', flex: 1 },
    { field: 'calories', headerName: 'Calories (kcal)', flex: 1 },
    { field: 'protein', headerName: 'Protein (g)', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 }
  ];

  logRowData = signal<any[]>([]);

  ngOnInit(): void {
    this.service.getSummary().subscribe(data => this.summary.set(data));
    this.service.getNutrition().subscribe(data => {
      this.nutrition.set(data);
      if (data) {
        this.nutritionChartOptions.update(opts => ({
          ...opts,
          data: [
            { category: 'Protein', value: data.proteinPct },
            { category: 'Carbs', value: data.carbsPct },
            { category: 'Fat', value: data.fatPct }
          ]
        }));
      }
    });
    this.service.getTasks().subscribe(data => this.tasks.set(data));
    this.service.getWeightTrend().subscribe(data => {
      this.weightTrend.set(data);
      this.trendChartOptions.update(opts => ({
        ...opts,
        data: data
      }));
    });

    this.logRowData.set([
      { date: '2026-06-25', weight: 78.5, calories: 1640, protein: 82, status: 'On Track' },
      { date: '2026-06-24', weight: 78.7, calories: 1850, protein: 90, status: 'Streak Met' },
      { date: '2026-06-23', weight: 79.0, calories: 1720, protein: 85, status: 'On Track' },
      { date: '2026-06-22', weight: 79.2, calories: 2100, protein: 95, status: 'Streak Met' },
      { date: '2026-06-21', weight: 79.5, calories: 1950, protein: 88, status: 'On Track' }
    ]);
  }

  toggleTask(task: DashboardTask): void {
    const updatedCompleted = !task.completed;
    this.service.toggleTask(task.id, updatedCompleted).subscribe(() => {
      this.tasks.update(allTasks =>
        allTasks.map(t => (t.id === task.id ? { ...t, completed: updatedCompleted } : t))
      );
    });
  }

  getCaloriesPercent(): number {
    const nutr = this.nutrition();
    if (!nutr) return 0;
    const consumed = nutr.dailyGoalKcal - nutr.kcalConsumed;
    return Math.min(100, Math.max(0, (consumed / nutr.dailyGoalKcal) * 100));
  }

  getCaloriesOffset(): number {
    const circ = 2 * Math.PI * 58;
    const pct = this.getCaloriesPercent();
    return circ - (pct / 100) * circ;
  }

  getProteinOffset(): number {
    const circ = 2 * Math.PI * 42;
    const pct = 68.3;
    return circ - (pct / 100) * circ;
  }

  getCarbsOffset(): number {
    const circ = 2 * Math.PI * 42;
    const pct = 58.0;
    return circ - (pct / 100) * circ;
  }

  getFatOffset(): number {
    const circ = 2 * Math.PI * 42;
    const pct = 62.8;
    return circ - (pct / 100) * circ;
  }
}
