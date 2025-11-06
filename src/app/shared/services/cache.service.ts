import { Injectable } from '@angular/core';
import { CacheStore, CachePrefix, CacheData } from '../models/cache.model';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private readonly CACHE_KEY = 'movie_cache_store';
  private readonly CLEANUP_INTERVAL_MS = 120000;

  constructor() {
    this.removeExpired();
    setInterval((): void => {
      this.removeExpired();
    }, this.CLEANUP_INTERVAL_MS);
  }

  save<T>(key: string, value: T, ttlMinutes: number): void {
    const expiry: number = Date.now() + ttlMinutes * 60 * 1000;
    const cacheStore: CacheStore = this.getCacheStore();
    cacheStore[key] = { value, expiry };
    this.setCacheStore(cacheStore);
    console.log(`Cache saved: ${key}`);
  }

  retrieve<T>(key: string): T | null {
    const cacheStore: CacheStore = this.getCacheStore();
    const cached: CacheData | undefined = cacheStore[key];

    if (!cached) {
      console.log(`Cache miss: ${key}`);
      return null;
    }

    if (Date.now() > cached.expiry) {
      delete cacheStore[key];
      this.setCacheStore(cacheStore);
      console.log(`Cache expired: ${key}`);
      return null;
    }

    console.log(`Cache hit: ${key}`);
    return cached.value as T;
  }

  invalidate(key: string): void {
    const cacheStore: CacheStore = this.getCacheStore();
    if (cacheStore[key]) {
      delete cacheStore[key];
      this.setCacheStore(cacheStore);
      console.log(`Cache invalidated: ${key}`);
    }
  }

  invalidateByPrefix(prefix: CachePrefix): void {
    const cacheStore: CacheStore = this.getCacheStore();
    const keysToDelete: string[] = Object.keys(cacheStore).filter(
      (key: string): boolean => key.startsWith(prefix)
    );

    if (keysToDelete.length > 0) {
      keysToDelete.forEach((key: string): void => {
        delete cacheStore[key];
      });
      this.setCacheStore(cacheStore);
      console.log(
        `Cache invalidated for prefix: ${prefix}, keys: ${keysToDelete.length}`
      );
    }
  }

  clearAll(): void {
    localStorage.removeItem(this.CACHE_KEY);
    console.log('All cache cleared');
  }

  private getCacheStore(): CacheStore {
    const stored: string | null = localStorage.getItem(this.CACHE_KEY);
    if (!stored) {
      return {};
    }
    return JSON.parse(stored) as CacheStore;
  }

  private setCacheStore(cacheStore: CacheStore): void {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheStore));
  }

  private removeExpired(): void {
    const now: number = Date.now();
    const cacheStore: CacheStore = this.getCacheStore();
    let hasExpired: boolean = false;

    Object.keys(cacheStore).forEach((key: string): void => {
      if (now > cacheStore[key].expiry) {
        delete cacheStore[key];
        hasExpired = true;
      }
    });

    if (hasExpired) {
      this.setCacheStore(cacheStore);
      console.log('Expired cache entries removed');
    }
  }
}
