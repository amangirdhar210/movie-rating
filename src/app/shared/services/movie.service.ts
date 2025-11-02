import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Movie } from '../models/movie.model';
import { CacheService } from './cache.service';

export interface TrendingMoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly TRENDING_CACHE_TTL = 5;
  private readonly SEARCH_CACHE_TTL = 3;

  constructor(private http: HttpClient, private cacheService: CacheService) {}

  getTrendingMovies(
    timeWindow: 'day' | 'week' = 'week',
    page: number = 1
  ): Observable<TrendingMoviesResponse> {
    const cacheKey = `trending_${timeWindow}_page_${page}`;
    const cached = this.cacheService.retrieve(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http
      .get<TrendingMoviesResponse>(`/trending/movie/${timeWindow}?page=${page}`)
      .pipe(
        tap((response) => {
          this.cacheService.save(cacheKey, response, this.TRENDING_CACHE_TTL);
        })
      );
  }

  searchMovies(
    query: string,
    page: number = 1
  ): Observable<TrendingMoviesResponse> {
    const cacheKey = `search_${query.toLowerCase()}_page_${page}`;
    const cached = this.cacheService.retrieve(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http
      .get<TrendingMoviesResponse>(
        `/search/movie?query=${encodeURIComponent(query)}&page=${page}`
      )
      .pipe(
        tap((response) => {
          this.cacheService.save(cacheKey, response, this.SEARCH_CACHE_TTL);
        })
      );
  }

  clearCache(): void {
    this.cacheService.clearAll();
  }
}
