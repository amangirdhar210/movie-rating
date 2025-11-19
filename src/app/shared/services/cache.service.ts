import { Injectable } from '@angular/core';
import {
  CacheStore,
  CachePrefix,
  CacheData,
  CacheableResponse,
} from '../models/cache.model';
import { CACHE_CONFIG } from '../constants/app.config';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private readonly CACHE_KEY = CACHE_CONFIG.storageKey;
  private readonly CLEANUP_INTERVAL_MS = CACHE_CONFIG.cleanupIntervalMs;

  constructor() {
    this.removeExpired();
    setInterval((): void => {
      this.removeExpired();
    }, this.CLEANUP_INTERVAL_MS);
  }

  save<T extends CacheableResponse>(
    key: string,
    value: T,
    ttlMinutes: number
  ): void {
    const expiry: number = Date.now() + ttlMinutes * 60 * 1000;
    const cacheStore: CacheStore = this.getCacheStore();
    const cacheData: CacheData<T> = {
      value,
      expiry,
    };
    cacheStore[key] = cacheData as CacheData<CacheableResponse>;
    this.setCacheStore(cacheStore);
  }

  retrieve<T extends CacheableResponse>(key: string): T | null {
    const cacheStore: CacheStore = this.getCacheStore();
    const cached: CacheData | undefined = cacheStore[key];

    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiry) {
      delete cacheStore[key];
      this.setCacheStore(cacheStore);
      return null;
    }

    return cached.value as T;
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
    }
  }

  clearAll(): void {
    localStorage.removeItem(this.CACHE_KEY);
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
    }
  }
}
