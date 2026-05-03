import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  loading = true;
  search = '';
  selectedCategory = '';
  selectedStatus = '';
  currentPage = 1;
  totalPages = 1;
  total = 0;
  showRequestModal = false;
  selectedProduct: any = null;
  requestQty = 1;
  requestReason = '';
  requesting = false;
  requestSuccess = '';
  requestError = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private requestService: RequestService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data: any[]) => { this.categories = data; this.cdr.markForCheck(); }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.productService.getAll({
      search: this.search,
      category_id: this.selectedCategory,
      status: this.selectedStatus,
      page: this.currentPage,
      limit: 9
    }).subscribe({
      next: (data: any) => {
        this.products = data.products || [];
        this.total = data.total || 0;
        this.totalPages = data.totalPages || 1;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  onSearch(): void { this.currentPage = 1; this.loadProducts(); }
  goToPage(p: number): void { if (p < 1 || p > this.totalPages) return; this.currentPage = p; this.loadProducts(); }

  openRequest(product: any): void {
    this.selectedProduct = product;
    this.requestQty = 1;
    this.requestReason = '';
    this.requestSuccess = '';
    this.requestError = '';
    this.showRequestModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void { this.showRequestModal = false; this.cdr.markForCheck(); }

  submitRequest(): void {
    if (!this.requestQty || this.requestQty < 1) return;
    this.requesting = true;
    this.requestService.create({
      product_id: this.selectedProduct.id,
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
        this.requestError = err.error?.message || 'Request failed';
        this.cdr.markForCheck();
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: any = {
      available: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      low_stock: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      out_of_stock: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    return colors[status] || '';
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}