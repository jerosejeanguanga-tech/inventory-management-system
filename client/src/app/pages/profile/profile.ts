import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  form: FormGroup;
  loading = false;
  success = '';
  error = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  activeTab: 'info' | 'security' = 'info';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      location: [''],
    });
  }

  ngOnInit(): void {
    this.http.get(`${environment.apiUrl}/api/users/profile`).subscribe({
      next: (data: any) => {
        this.profile = data;
        this.form.patchValue({
          name: data.name,
          phone: data.phone || '',
          location: data.location || ''
        });
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Could not load profile';
        this.cdr.markForCheck();
      }
    });
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const formData = new FormData();
    formData.append('name', this.form.value.name);
    formData.append('phone', this.form.value.phone || '');
    formData.append('location', this.form.value.location || '');
    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile);
    }

    this.http.put(`${environment.apiUrl}/api/users/profile`, formData).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.success = 'Profile updated successfully!';
        if (res.profile_image) {
          this.profile = { ...this.profile, profile_image: res.profile_image };
        }
        this.selectedFile = null;
        this.previewUrl = null;
        setTimeout(() => { this.success = ''; this.cdr.markForCheck(); }, 3000);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Update failed';
        this.cdr.markForCheck();
      }
    });
  }

  getRoleBadge(): string {
    return this.profile?.role === 'admin'
      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  }
}