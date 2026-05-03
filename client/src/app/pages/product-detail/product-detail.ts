import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  loading = true;
  notFound = false;

  showRequestModal = false;
  requestQty = 1;
  requestReason = '';
  requesting = false;
  requestSuccess = '';
  requestError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private requestService: RequestService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/products']); return; }

    this.productService.getById(Number(id)).subscribe({
      next: (data: any) => {
        this.product = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.notFound = true;
        this.cdr.markForCheck();
      }
    });
  }

  getStatusColor(status: string): string {
    const map: any = {
      available:    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      low_stock:    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      out_of_stock: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      available:    '✅ Available',
      low_stock:    '⚠️ Low Stock',
      out_of_stock: '❌ Out of Stock',
    };
    return map[status] || status;
  }

  openRequest(): void {
    this.requestQty = 1;
    this.requestReason = '';
    this.requestSuccess = '';
    this.requestError = '';
    this.showRequestModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showRequestModal = false;
    this.cdr.markForCheck();
  }

  submitRequest(): void {
    if (!this.requestQty || this.requestQty < 1) return;
    this.requesting = true;
    this.requestError = '';
    this.requestService.create({
      product_id: this.product.id,
      quantity_requested: this.requestQty,
      reason: this.requestReason
    }).subscribe({
      next: () => {
        this.requesting = false;
        this.requestSuccess = 'Request submitted successfully!';
        setTimeout(() => this.closeModal(), 2000);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.requesting = false;
        this.requestError = err.error?.message || 'Request failed. Try again.';
        this.cdr.markForCheck();
      }
    });
  }
}