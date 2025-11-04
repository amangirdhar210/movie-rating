import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { TrendingMoviesResponse } from '../models/movie.model';
import { CacheService } from './cache.service';
import { CachePrefix } from '../models/cache.model';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly TRENDING_CACHE_TTL_MINUTES = 5;
  private readonly SEARCH_CACHE_TTL_MINUTES = 3;

  constructor(private http: HttpClient, private cacheService: CacheService) {}

  getTrendingMovies(
    timeWindow: 'day' | 'week' = 'week',
    page: number = 1
  ): Observable<TrendingMoviesResponse> {
    const cacheKey: string = `${CachePrefix.TRENDING}_${timeWindow}_page_${page}`;
    const cached: TrendingMoviesResponse | null =
      this.cacheService.retrieve<TrendingMoviesResponse>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http
      .get<TrendingMoviesResponse>(`/trending/movie/${timeWindow}?page=${page}`)
      .pipe(
        tap((response: TrendingMoviesResponse): void => {
          this.cacheService.save(
            cacheKey,
            response,
            this.TRENDING_CACHE_TTL_MINUTES
          );
        })
      );
  }

  searchMovies(
    query: string,
    page: number = 1
  ): Observable<TrendingMoviesResponse> {
    const cacheKey: string = `${
      CachePrefix.SEARCH
    }_${query.toLowerCase()}_page_${page}`;
    const cached: TrendingMoviesResponse | null =
      this.cacheService.retrieve<TrendingMoviesResponse>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http
      .get<TrendingMoviesResponse>(
        `/search/movie?query=${encodeURIComponent(query)}&page=${page}`
      )
      .pipe(
        tap((response: TrendingMoviesResponse): void => {
          this.cacheService.save(
            cacheKey,
            response,
            this.SEARCH_CACHE_TTL_MINUTES
          );
        })
      );
  }

  clearCache(): void {
    this.cacheService.clearAll();
  }
}
