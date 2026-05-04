import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

export function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const errors: any = {};

  if (value.length < 8) errors['minLength'] = true;
  if (!/[A-Z]/.test(value)) errors['noUppercase'] = true;
  if (!/[a-z]/.test(value)) errors['noLowercase'] = true;
  if (!/[0-9]/.test(value)) errors['noNumber'] = true;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) errors['noSymbol'] = true;

  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.html',
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+63|0)[0-9]{10}$/)]],
      location: ['', Validators.required],
      password: ['', [Validators.required, strongPasswordValidator]],
    });
  }

  get f() { return this.form.controls; }

  getPasswordStrength(): number {
    const pwd = this.form.get('password')?.value || '';
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++;
    return strength;
  }

  getStrengthColor(index: number): string {
    const strength = this.getPasswordStrength();
    if (index >= strength) return 'bg-gray-700';
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-emerald-500';
  }

  getStrengthLabel(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 1) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Strong';
    return 'Very Strong ✅';
  }

  getStrengthLabelColor(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 1) return 'text-red-500';
    if (strength <= 2) return 'text-red-400';
    if (strength <= 3) return 'text-yellow-400';
    return 'text-emerald-400';
  }

  get phoneError(): string {
    const ctrl = this.form.get('phone');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'Phone number is required';
      if (ctrl.errors['pattern']) return 'Enter a valid PH number (e.g. 09123456789)';
    }
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed';
      }
    });
  }
}