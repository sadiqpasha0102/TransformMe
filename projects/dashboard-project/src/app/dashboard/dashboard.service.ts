import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface DashboardSummary {
  currentWeight: number;
  targetWeight: number;
  weightLost: number;
  currentStreak: number;
}

export interface NutritionSummary {
  dailyGoalKcal: number;
  kcalConsumed: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

export interface DashboardTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface WeightTrendPoint {
  day: number;
  weight: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/v1/dashboard';

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`).pipe(
      catchError(() => of({
        currentWeight: 78.5,
        targetWeight: 72.0,
        weightLost: -4.2,
        currentStreak: 12
      }))
    );
  }

  getNutrition(): Observable<NutritionSummary> {
    return this.http.get<NutritionSummary>(`${this.apiUrl}/nutrition`).pipe(
      catchError(() => of({
        dailyGoalKcal: 2200,
        kcalConsumed: 1640,
        proteinG: 82,
        carbsG: 145,
        fatG: 44,
        proteinPct: 30,
        carbsPct: 45,
        fatPct: 25
      }))
    );
  }

  getTasks(): Observable<DashboardTask[]> {
    return this.http.get<DashboardTask[]>(`${this.apiUrl}/tasks`).pipe(
      catchError(() => of([
        { id: '1', title: 'Log Weight', completed: true },
        { id: '2', title: 'Daily Progress Photo', completed: false },
        { id: '3', title: 'Log Lunch', completed: false }
      ]))
    );
  }

  toggleTask(id: string, completed: boolean): Observable<DashboardTask> {
    return this.http.put<DashboardTask>(`${this.apiUrl}/tasks/${id}`, { completed }).pipe(
      catchError(() => of({ id, title: '', completed }))
    );
  }

  getWeightTrend(): Observable<WeightTrendPoint[]> {
    return this.http.get<WeightTrendPoint[]>(`${this.apiUrl}/weight-trend`).pipe(
      catchError(() => of([
        { day: 1, weight: 80.0 },
        { day: 2, weight: 79.5 },
        { day: 3, weight: 79.2 },
        { day: 4, weight: 79.0 },
        { day: 5, weight: 78.7 },
        { day: 6, weight: 78.5 }
      ]))
    );
  }
}
