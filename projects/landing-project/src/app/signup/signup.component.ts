import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserHealthDetailsComponent } from '../user-health-details/user-health-details.component';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, UserHealthDetailsComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private router = inject(Router);
  activeLink = signal<string>('features');

  isModalOpen = signal<boolean>(false);
  authMode = signal<'login' | 'signup'>('signup');

  fullName = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  agreeToTerms = signal<boolean>(false);

  isSubmitting = signal<boolean>(false);
  formSubmitted = signal<boolean>(false);
  errorMessage = signal<string>('');
  existingUsers = signal<string[]>(['sarah@example.com', 'alex@example.com', 'user@example.com']);
  showHealthDetailsModal = signal<boolean>(false);

  features = signal([
    {
      id: 'coach',
      icon: 'camera_alt',
      title: 'AI Nutrition Coach',
      description: 'Snap a photo, get insights. No more tedious manual calorie counting.',
      detailed: 'Our soft-AI analysis identifies nutrient-dense ingredients in your meals and offers gentle encouragement rather than strict restriction. Build intuitive eating habits naturally.',
      expanded: false
    },
    {
      id: 'journey',
      icon: 'visibility',
      title: 'Visual Journey',
      description: 'Private progress vault to see your change beyond the scale.',
      detailed: 'See your body transformation, posture improvements, and vibrant energy over time. Completely secure, private, and designed to capture qualitative improvements.',
      expanded: false
    },
    {
      id: 'metrics',
      icon: 'mood',
      title: 'Mindful Metrics',
      description: 'Track mood and energy trends to find your rhythm.',
      detailed: 'Log daily wellness parameters with simple, intuitive sliders. Uncover subtle correlations between your physical activity, sleep cycles, and daily emotional state.',
      expanded: false
    }
  ]);

  currentTestimonialIndex = signal<number>(0);
  testimonials = signal([
    {
      quote: "The AI coach doesn’t just give me numbers; it gives me encouragement. It feels like a partner who understands that some days are harder than others.",
      author: "Sarah J.",
      role: "Premium Member since 2023",
      image: "assets/sarah-j.jpg"
    },
    {
      quote: "Focusing on progress over perfection changed my life. TransformMe is so gentle and supportive compared to other aggressive health trackers.",
      author: "Marcus E.",
      role: "Active Member since 2024",
      image: "assets/marcus-e.jpg"
    },
    {
      quote: "The daily insights keep me motivated. Even simple habits, like tracking my hydration and morning mood, feel celebrated by the AI.",
      author: "Elena R.",
      role: "Premium Member since 2025",
      image: "assets/elena-r.jpg"
    }
  ]);

  setActiveLink(link: string): void {
    this.activeLink.set(link);
    const element = document.getElementById(link);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleFeature(index: number): void {
    const updatedFeatures = this.features().map((feature, i) => {
      if (i === index) {
        return { ...feature, expanded: !feature.expanded };
      }
      return feature;
    });
    this.features.set(updatedFeatures);
  }

  nextTestimonial(): void {
    const nextIndex = (this.currentTestimonialIndex() + 1) % this.testimonials().length;
    this.currentTestimonialIndex.set(nextIndex);
  }

  prevTestimonial(): void {
    const prevIndex = (this.currentTestimonialIndex() - 1 + this.testimonials().length) % this.testimonials().length;
    this.currentTestimonialIndex.set(prevIndex);
  }

  openModal(mode: 'login' | 'signup' = 'signup'): void {
    this.authMode.set(mode);
    this.isModalOpen.set(true);
    this.formSubmitted.set(false);
    this.errorMessage.set('');
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isSubmitting.set(false);
    this.formSubmitted.set(false);
    document.body.style.overflow = 'auto';
  }

  switchAuthMode(mode: 'login' | 'signup'): void {
    this.authMode.set(mode);
    this.errorMessage.set('');
  }

  handleAuthSubmit(event: Event): void {
    event.preventDefault();
    const currentEmail = this.email().trim().toLowerCase();

    if (!currentEmail || !this.password()) {
      this.errorMessage.set('Please fill out all required fields.');
      return;
    }
    if (this.authMode() === 'signup' && !this.fullName()) {
      this.errorMessage.set('Please provide your name.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    setTimeout(() => {
      const isSignup = this.authMode() === 'signup';

      if (isSignup) {
        if (this.existingUsers().includes(currentEmail)) {
          this.isSubmitting.set(false);
          this.errorMessage.set('An account with this email already exists. Please login.');
          return;
        }
        this.existingUsers.update(users => [...users, currentEmail]);
      } else {
        if (!this.existingUsers().includes(currentEmail)) {
          this.isSubmitting.set(false);
          this.errorMessage.set('Account does not exist. Please sign up.');
          return;
        }
      }

      this.isSubmitting.set(false);
      this.formSubmitted.set(true);

      setTimeout(() => {
        this.closeModal();
        if (isSignup) {
          this.showHealthDetailsModal.set(true);
          document.body.style.overflow = 'hidden';
        } else {
          this.router.navigate(['/home']);
        }
        this.fullName.set('');
        this.email.set('');
        this.password.set('');
        this.agreeToTerms.set(false);
      }, 2000);
    }, 1500);
  }

  onOnboardingComplete(): void {
    this.showHealthDetailsModal.set(false);
    document.body.style.overflow = 'auto';
    window.location.href = 'http://localhost:4202/dashboard';
  }

  onOnboardingClose(): void {
    this.showHealthDetailsModal.set(false);
    document.body.style.overflow = 'auto';
  }
}
