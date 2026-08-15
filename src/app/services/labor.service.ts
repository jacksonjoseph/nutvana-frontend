import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Labor } from '../models/labor.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LaborService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/labors`;

  getAll(): Observable<Labor[]> {
    return this.http.get<Labor[]>(this.baseUrl);
  }

  create(labor: Labor): Observable<Labor> {
    return this.http.post<Labor>(this.baseUrl, labor);
  }
}
