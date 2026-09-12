import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Token } from '../models/models';

const STORAGE_KEY = 'destete_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  session = signal<Token | null>(this.readSession());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private readSession(): Token | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Token) : null;
  }

  login(email: string, password: string): Observable<Token> {
    return this.http.post<Token>('/api/v1/auth/login', { email, password }).pipe(
      tap((token) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
        this.session.set(token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.session.set(null);
    this.router.navigate(['/login']);
  }

  get token(): string | null {
    return this.session()?.access_token ?? null;
  }

  get isAdmin(): boolean {
    return this.session()?.rol === 'admin';
  }

  get isLoggedIn(): boolean {
    return !!this.session();
  }
}
