import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../../services/request.service';

@Component({
  selector: 'app-manage-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './manage-requests.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageRequestsComponent implements OnInit {
  requests: any[] = [];
  loading = true;
  search = '';
  statusFilter = '';
  currentPage = 1;
  itemsPerPage = 10;
  paginatedItems: any[] = [];
  totalPages = 1;
  mobileMenuOpen = false;

  showModal = false;
  selectedRequest: any = null;
  newStatus = '';
  adminNotes = '';
  saving = false;

  constructor(private requestService: RequestService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.requestService.getAllRequests().subscribe({
      next: (d: any[]) => {
        this.requests = [...d];
        this.loading = false;
        this.filter();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  filter(): void {
    let filtered = this.requests.filter((r: any) => {
      const ms = !this.search || r.product_name?.toLowerCase().includes(this.search.toLowerCase()) || r.user_name?.toLowerCase().includes(this.search.toLowerCase());
      const mst = !this.statusFilter || r.status === this.statusFilter;
      return ms && mst;
    });
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.itemsPerPage));
    this.currentPage = 1;
    this.paginatedItems = filtered.slice(0, this.itemsPerPage);
    this.cdr.markForCheck();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    let filtered = this.requests.filter((r: any) => {
      const ms = !this.search || r.product_name?.toLowerCase().includes(this.search.toLowerCase()) || r.user_name?.toLowerCase().includes(this.search.toLowerCase());
      const mst = !this.statusFilter || r.status === this.statusFilter;
      return ms && mst;
    });
    const start = (p - 1) * this.itemsPerPage;
    this.paginatedItems = filtered.slice(start, start + this.itemsPerPage);
    this.cdr.markForCheck();
  }

  openAction(r: any): void {
    this.selectedRequest = r;
    this.newStatus = r.status;
    this.adminNotes = r.admin_notes || '';
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void { this.showModal = false; this.cdr.markForCheck(); }

  saveStatus(): void {
    this.saving = true;
    this.requestService.updateStatus(this.selectedRequest.id, {
      status: this.newStatus,
      admin_notes: this.adminNotes
    }).subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: (err: any) => { this.saving = false; alert(err.error?.message || 'Error'); }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this request?')) return;
    this.requestService.delete(id).subscribe({ next: () => this.load() });
  }

  getStatusConfig(status: string): any {
    const map: any = {
      pending:   { color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', icon: '⏳' },
      approved:  { color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', icon: '✅' },
      fulfilled: { color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', icon: '🎉' },
      rejected:  { color: 'bg-red-500/20 text-red-400 border border-red-500/30', icon: '❌' },
    };
    return map[status] || { color: 'bg-gray-500/20 text-gray-400', icon: '•' };
  }

  getPages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
}