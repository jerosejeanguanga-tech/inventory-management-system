import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  userName = '';
  currentUser: any = null;
  userMenuOpen = false;
  mobileMenuOpen = false;

  constructor(private auth: AuthService, private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.userMenuOpen = false;
        this.mobileMenuOpen = false;
      }
    });
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
      this.userName = user?.name || '';
    });
  }

  goHome(): void {
    this.isAdmin
      ? this.router.navigate(['/admin/dashboard'])
      : this.router.navigate(['/']);
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void { this.userMenuOpen = false; }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
    this.auth.logout();
  }
}