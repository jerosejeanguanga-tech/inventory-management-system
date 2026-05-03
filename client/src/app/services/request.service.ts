import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private apiUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getMyRequests(filters?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page);
    return this.http.get<any[]>(`${this.apiUrl}/my`, { params });
  }

  getAllRequests(filters?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page);
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  updateStatus(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}