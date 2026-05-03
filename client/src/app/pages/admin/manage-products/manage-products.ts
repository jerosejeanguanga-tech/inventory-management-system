import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-products.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  loading = true;
  search = '';
  selectedCategory = '';
  selectedStatus = '';
  currentPage = 1;
  totalPages = 1;
  total = 0;
  mobileMenuOpen = false;

  showModal = false;
  isEdit = false;
  editId: number | null = null;
  form: FormGroup;
  saving = false;
  formError = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  showStockModal = false;
  stockProduct: any = null;
  stockAction = 'add';
  stockQty = 1;
  stockSaving = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category_id: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unit: ['pcs', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({ next: (d: any[]) => { this.categories = d; this.cdr.markForCheck(); } });
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.productService.getAll({
      search: this.search, category_id: this.selectedCategory,
      status: this.selectedStatus, page: this.currentPage, limit: 10
    }).subscribe({
      next: (d: any) => {
        this.products = d.products || [];
        this.total = d.total || 0;
        this.totalPages = d.totalPages || 1;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  onSearch(): void { this.currentPage = 1; this.loadProducts(); }
  goToPage(p: number): void { if (p < 1 || p > this.totalPages) return; this.currentPage = p; this.loadProducts(); }
  getPages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  openAdd(): void {
    this.isEdit = false; this.editId = null;
    this.form.reset({ unit: 'pcs', quantity: 0, price: 0 });
    this.selectedFile = null; this.previewUrl = null; this.formError = '';
    this.showModal = true; this.cdr.markForCheck();
  }

  openEdit(p: any): void {
    this.isEdit = true; this.editId = p.id;
    this.form.patchValue({ name: p.name, description: p.description || '', category_id: p.category_id || '', quantity: p.quantity, unit: p.unit, price: p.price });
    this.selectedFile = null; this.previewUrl = null; this.formError = '';
    this.showModal = true; this.cdr.markForCheck();
  }

  closeModal(): void { this.showModal = false; this.cdr.markForCheck(); }

  onImageChange(e: any): void {
    const file = e.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (ev: any) => { this.previewUrl = ev.target.result; this.cdr.markForCheck(); };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.formError = '';
    const fd = new FormData();
    Object.entries(this.form.value).forEach(([k, v]) => fd.append(k, String(v ?? '')));
    if (this.selectedFile) fd.append('image', this.selectedFile);

    const obs = this.isEdit && this.editId
      ? this.productService.update(this.editId, fd)
      : this.productService.create(fd);

    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.loadProducts(); },
      error: (err: any) => { this.saving = false; this.formError = err.error?.message || 'Error saving'; this.cdr.markForCheck(); }
    });
  }

  deleteProduct(id: number): void {
    if (!confirm('Delete this product?')) return;
    this.productService.delete(id).subscribe({ next: () => this.loadProducts() });
  }

  openStock(p: any): void {
    this.stockProduct = p; this.stockAction = 'add'; this.stockQty = 1;
    this.showStockModal = true; this.cdr.markForCheck();
  }

  closeStockModal(): void { this.showStockModal = false; this.cdr.markForCheck(); }

  updateStock(): void {
    if (!this.stockQty || this.stockQty < 1) return;
    this.stockSaving = true;
    this.productService.updateStock(this.stockProduct.id, { quantity: this.stockQty, action: this.stockAction }).subscribe({
      next: () => { this.stockSaving = false; this.closeStockModal(); this.loadProducts(); },
      error: (err: any) => { this.stockSaving = false; alert(err.error?.message || 'Error'); }
    });
  }

  getStatusColor(status: string): string {
    const map: any = {
      available: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      low_stock: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      out_of_stock: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    return map[status] || '';
  }
}