import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  recentRequests: any[] = [];
  lowStockProducts: any[] = [];
  loading = true;
  mobileMenuOpen = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.http.get('http://localhost:3000/api/users/dashboard').subscribe({
      next: (data: any) => {
        this.stats = data.stats;
        this.recentRequests = data.recentRequests;
        this.lowStockProducts = data.lowStockProducts;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  getStatusColor(status: string): string {
    const map: any = {
      pending:   'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      approved:  'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      fulfilled: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      rejected:  'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    return map[status] || 'bg-gray-500/20 text-gray-400';
  }

  getStockColor(status: string): string {
    const map: any = {
      available:    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      low_stock:    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      out_of_stock: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    return map[status] || '';
  }
}