import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() { return this.form.controls; }

  fillAdmin(): void {
    this.form.setValue({
      email: 'admin@example.com',
      password: 'admin123',
    });
  }

  fillUser(): void {
    this.form.setValue({
      email: 'user@example.com',
      password: 'user123',
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.value).subscribe({
      next: (res: any) => {
        this.loading = false;
        res.user.role === 'admin'
          ? this.router.navigate(['/admin/dashboard'])
          : this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed';
      }
    });
  }
}