import { Injectable } from '@angular/core';
import { TrendingMoviesResponse } from './movie.service';

interface CacheData {
  value: TrendingMoviesResponse;
  expiry: number;
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private cacheStore: Map<string, CacheData> = new Map();

  constructor() {
    setInterval(() => {
      this.removeExpired();
    }, 60000);
  }

  save(key: string, value: TrendingMoviesResponse, minutes: number): void {
    const expiry = Date.now() + minutes * 60 * 1000;
    this.cacheStore.set(key, { value, expiry });
    console.log(`Cache saved: ${key}`);
  }

  retrieve(key: string): TrendingMoviesResponse | null {
    const cached = this.cacheStore.get(key);

    if (!cached) {
      console.log(`Cache miss: ${key}`);
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.cacheStore.delete(key);
      console.log(`Cache expired: ${key}`);
      return null;
    }

    console.log(`Cache hit: ${key}`);
    return cached.value;
  }

  clearAll(): void {
    this.cacheStore.clear();
  }

  private removeExpired(): void {
    const now = Date.now();
    this.cacheStore.forEach((item, key) => {
      if (now > item.expiry) {
        this.cacheStore.delete(key);
      }
    });
  }
}
