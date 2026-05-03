import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-requests.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyRequestsComponent implements OnInit {
  requests: any[] = [];
  loading = true;
  search = '';
  statusFilter = '';
  currentPage = 1;
  itemsPerPage = 8;
  paginatedItems: any[] = [];
  totalPages = 1;

  constructor(
    private requestService: RequestService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.requestService.getMyRequests().subscribe({
      next: (data: any[]) => {
        this.requests = [...data];
        this.loading = false;
        this.filter();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  filter(): void {
    let filtered = this.requests.filter((r: any) => {
      const matchSearch = !this.search ||
        r.product_name?.toLowerCase().includes(this.search.toLowerCase());
      const matchStatus = !this.statusFilter || r.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
    this.paginatedItems = filtered.slice(0, this.itemsPerPage);
    this.cdr.markForCheck();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    let filtered = this.requests.filter((r: any) => {
      const matchSearch = !this.search || r.product_name?.toLowerCase().includes(this.search.toLowerCase());
      const matchStatus = !this.statusFilter || r.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
    const start = (p - 1) * this.itemsPerPage;
    this.paginatedItems = filtered.slice(start, start + this.itemsPerPage);
    this.cdr.markForCheck();
  }

  cancel(id: number): void {
    if (!confirm('Cancel this request?')) return;
    this.requestService.delete(id).subscribe({
      next: () => this.load(),
      error: (err: any) => alert(err.error?.message || 'Error')
    });
  }

  getStatusConfig(status: string): any {
    const config: any = {
      pending:   { color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', icon: '⏳', label: 'Pending' },
      approved:  { color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', icon: '✅', label: 'Approved' },
      fulfilled: { color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', icon: '🎉', label: 'Fulfilled' },
      rejected:  { color: 'bg-red-500/20 text-red-400 border border-red-500/30', icon: '❌', label: 'Rejected' },
    };
    return config[status] || { color: 'bg-gray-500/20 text-gray-400', icon: '•', label: status };
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}