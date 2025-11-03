import { Injectable } from '@angular/core';
import { CacheStore } from '../models/cache.model';
import { TrendingMoviesResponse } from '../models/movie.model';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private readonly CACHE_KEY = 'movie_cache_store';

  constructor() {
    this.removeExpired();
    setInterval(() => {
      this.removeExpired();
    }, 120000);
  }

  save(key: string, value: TrendingMoviesResponse, minutes: number): void {
    const expiry = Date.now() + minutes * 60 * 1000;
    const cacheStore = this.getCacheStore();
    cacheStore[key] = { value, expiry };
    this.setCacheStore(cacheStore);
    console.log(`Cache saved: ${key}`); // only for caching demo
  }

  retrieve(key: string): TrendingMoviesResponse | null {
    const cacheStore = this.getCacheStore();
    const cached = cacheStore[key];

    if (!cached) {
      console.log(`Cache miss: ${key}`); // only for caching demo
      return null;
    }

    if (Date.now() > cached.expiry) {
      delete cacheStore[key];
      this.setCacheStore(cacheStore);
      console.log(`Cache expired: ${key}`); // only for caching demo
      return null;
    }

    console.log(`Cache hit: ${key}`); // only for caching demo
    return cached.value;
  }

  clearAll(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }

  private getCacheStore(): CacheStore {
    const stored = localStorage.getItem(this.CACHE_KEY);
    if (!stored) {
      return {};
    }
    return JSON.parse(stored);
  }

  private setCacheStore(cacheStore: CacheStore): void {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheStore));
  }

  private removeExpired(): void {
    const now = Date.now();
    const cacheStore = this.getCacheStore();
    let hasExpired = false;

    Object.keys(cacheStore).forEach((key) => {
      if (now > cacheStore[key].expiry) {
        delete cacheStore[key];
        hasExpired = true;
      }
    });

    if (hasExpired) {
      this.setCacheStore(cacheStore);
    }
  }
}
