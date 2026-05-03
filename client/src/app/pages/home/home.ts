import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  isLoggedIn = false;
  loading = true;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.auth.currentUser$.subscribe((user: any) => {
      this.isLoggedIn = !!user;
      this.cdr.detectChanges();
    });
    this.loadData();
  }

  loadData(): void {
    this.categoryService.getAll().subscribe({
      next: (data: any[]) => {
        this.categories = data.slice(0, 5);
        this.cdr.detectChanges();
      }
    });

    if (this.isLoggedIn) {
      this.productService.getAll({ limit: 6 }).subscribe({
        next: (data: any) => {
          this.products = data.products || [];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => { this.loading = false; this.cdr.detectChanges(); }
      });
    } else {
      this.loading = false;
    }
  }

  getStatusColor(status: string): string {
    const colors: any = {
      available: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      low_stock: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      out_of_stock: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  }
}