import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-health-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-health-details.component.html',
  styleUrl: './user-health-details.component.scss'
})
export class UserHealthDetailsComponent {
  complete = output<void>();
  closeModal = output<void>();

  currentStep = signal<number>(1);
  totalSteps = 4;

  fullName = signal<string>('');
  age = signal<number | null>(null);
  gender = signal<string>('Female');
  height = signal<number | null>(null);
  weight = signal<number | null>(null);
  selectedGoal = signal<string>('fat-loss');
  targetWeight = signal<number | null>(null);
  activityLevel = signal<string>('sedentary');
  onboardingComplete = signal<boolean>(false);

  genderOptions = signal(['Female', 'Male', 'Non-binary', 'Prefer not to say']);

  goals = signal([
    { id: 'fat-loss', label: 'Fat Loss', icon: 'fitness_center' },
    { id: 'muscle-gain', label: 'Muscle Gain', icon: 'bolt' },
    { id: 'maintenance', label: 'Maintenance', icon: 'balance' }
  ]);

  activities = signal([
    { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little to no exercise.', icon: 'desktop_windows' },
    { id: 'light', label: 'Lightly Active', desc: 'Light exercise or sports 1-3 days/week.', icon: 'directions_walk' },
    { id: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week.', icon: 'fitness_center' },
    { id: 'active', label: 'Very Active', desc: 'Hard exercise or sports 6-7 days/week.', icon: 'bolt' }
  ]);

  nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(val => val + 1);
    } else {
      this.onboardingComplete.set(true);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(val => val - 1);
    }
  }

  selectGoal(goalId: string): void {
    this.selectedGoal.set(goalId);
  }

  selectActivity(activityId: string): void {
    this.activityLevel.set(activityId);
  }

  finish(): void {
    this.complete.emit();
  }

  close(): void {
    this.closeModal.emit();
  }
}
