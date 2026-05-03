import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './manage-categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageCategoriesComponent implements OnInit {
  categories: any[] = [];
  loading = true;
  mobileMenuOpen = false;
  showModal = false;
  isEdit = false;
  editId: number | null = null;
  catName = '';
  catDesc = '';
  saving = false;
  error = '';

  constructor(private categoryService: CategoryService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.categoryService.getAll().subscribe({
      next: (d: any[]) => { this.categories = d; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  openAdd(): void {
    this.isEdit = false; this.editId = null;
    this.catName = ''; this.catDesc = ''; this.error = '';
    this.showModal = true; this.cdr.markForCheck();
  }

  openEdit(c: any): void {
    this.isEdit = true; this.editId = c.id;
    this.catName = c.name; this.catDesc = c.description || ''; this.error = '';
    this.showModal = true; this.cdr.markForCheck();
  }

  closeModal(): void { this.showModal = false; this.cdr.markForCheck(); }

  onSubmit(): void {
    if (!this.catName.trim()) { this.error = 'Category name is required'; return; }
    this.saving = true; this.error = '';
    const data = { name: this.catName.trim(), description: this.catDesc.trim() };
    const obs = this.isEdit && this.editId
      ? this.categoryService.update(this.editId, data)
      : this.categoryService.create(data);
    obs.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: (err: any) => { this.saving = false; this.error = err.error?.message || 'Error'; this.cdr.markForCheck(); }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this category? Products in it will become uncategorized.')) return;
    this.categoryService.delete(id).subscribe({ next: () => this.load() });
  }
}