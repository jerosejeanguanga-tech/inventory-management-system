import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './manage-users.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  filtered: any[] = [];
  paginatedItems: any[] = [];
  loading = true;
  search = '';
  roleFilter = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  mobileMenuOpen = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
      next: (d: any[]) => {
        this.users = [...d];
        this.loading = false;
        this.filter();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  filter(): void {
    this.filtered = this.users.filter((u: any) => {
      const ms = !this.search ||
        u.name?.toLowerCase().includes(this.search.toLowerCase()) ||
        u.email?.toLowerCase().includes(this.search.toLowerCase());
      const mr = !this.roleFilter || u.role === this.roleFilter;
      return ms && mr;
    });
    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.itemsPerPage));
    this.currentPage = 1;
    this.paginatedItems = this.filtered.slice(0, this.itemsPerPage);
    this.cdr.markForCheck();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    const start = (p - 1) * this.itemsPerPage;
    this.paginatedItems = this.filtered.slice(start, start + this.itemsPerPage);
    this.cdr.markForCheck();
  }

  getRoleBadge(role: string): string {
    return role === 'admin'
      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  }

  getPages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
}