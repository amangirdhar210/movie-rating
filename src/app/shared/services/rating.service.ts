import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, map, forkJoin, of, tap } from 'rxjs';

import {
  RatedMovie,
  RatedMoviesResponse,
  AddRatingRequest,
  AddRatingResponse,
  DeleteRatingResponse,
} from '../models/app.models';
import { ACCOUNT_ID } from '../constants';
import { CacheService } from './cache.service';
import { CachePrefix } from '../models/cache.model';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private readonly CACHE_TTL_MINUTES = 10;
  private ratedMoviesCache: Map<number, number> = new Map();

  constructor(private http: HttpClient, private cacheService: CacheService) {}

  getRatedMovies(page: number = 1): Observable<RatedMoviesResponse> {
    const cacheKey: string = `${CachePrefix.RATINGS}_page_${page}`;
    const cachedData: RatedMoviesResponse | null =
      this.cacheService.retrieve<RatedMoviesResponse>(cacheKey);

    if (cachedData) {
      this.updateInMemoryCache(cachedData, page);
      return of(cachedData);
    }

    return this.http
      .get<RatedMoviesResponse>(
        `/account/${ACCOUNT_ID}/rated/movies?page=${page}`
      )
      .pipe(
        map((response: RatedMoviesResponse): RatedMoviesResponse => {
          return this.processRatedMoviesResponse(response, page);
        }),
        tap((response: RatedMoviesResponse): void => {
          this.cacheService.save(cacheKey, response, this.CACHE_TTL_MINUTES);
        })
      );
  }

  private processRatedMoviesResponse(
    response: RatedMoviesResponse,
    page: number
  ): RatedMoviesResponse {
    if (page === 1) {
      this.ratedMoviesCache.clear();
    }

    response.results.forEach((movie: RatedMovie): void => {
      const rating: number = movie.rating || movie.userRating || 0;
      this.ratedMoviesCache.set(movie.id, rating);
      movie.userRating = rating;
    });

    response.results.sort(
      (a: RatedMovie, b: RatedMovie): number => b.userRating - a.userRating
    );

    return response;
  }

  private updateInMemoryCache(
    response: RatedMoviesResponse,
    page: number
  ): void {
    if (page === 1) {
      this.ratedMoviesCache.clear();
    }

    response.results.forEach((movie: RatedMovie): void => {
      const rating: number = movie.rating || movie.userRating || 0;
      this.ratedMoviesCache.set(movie.id, rating);
    });
  }

  getRating(movieId: number): number {
    return this.ratedMoviesCache.get(movieId) || 0;
  }

  setRating(movieId: number, rating: number): Observable<AddRatingResponse> {
    if (rating === 0) {
      return this.removeRating(movieId);
    }

    this.ratedMoviesCache.set(movieId, rating);

    const request: AddRatingRequest = { value: rating };
    return this.http
      .post<AddRatingResponse>(`/movie/${movieId}/rating`, request)
      .pipe(
        tap((): void => {
          this.invalidateRatingsCache();
        })
      );
  }

  removeRating(movieId: number): Observable<DeleteRatingResponse> {
    this.ratedMoviesCache.delete(movieId);

    return this.http
      .delete<DeleteRatingResponse>(`/movie/${movieId}/rating`)
      .pipe(
        tap((): void => {
          this.invalidateRatingsCache();
        })
      );
  }

  clearAllRatings(): Observable<DeleteRatingResponse[]> {
    const movieIds: number[] = Array.from(this.ratedMoviesCache.keys());

    if (movieIds.length === 0) {
      return of([]);
    }

    const deleteRequests: Observable<DeleteRatingResponse>[] = movieIds.map(
      (movieId: number): Observable<DeleteRatingResponse> =>
        this.removeRating(movieId)
    );

    return forkJoin(deleteRequests).pipe(
      tap((): void => {
        this.invalidateRatingsCache();
      })
    );
  }

  private invalidateRatingsCache(): void {
    this.cacheService.invalidateByPrefix(CachePrefix.RATINGS);
  }
}
