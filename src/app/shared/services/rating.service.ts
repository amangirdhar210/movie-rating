import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  map,
  forkJoin,
  of,
  tap,
  switchMap,
  catchError,
  throwError,
} from 'rxjs';

import {
  RatedMovie,
  RatedMoviesResponse,
  AddRatingRequest,
  AddRatingResponse,
  DeleteRatingResponse,
} from '../models/app.models';
import { ACCOUNT_ID, APP_CONFIG } from '../constants';
import { CacheService } from './cache.service';
import { CachePrefix } from '../models/cache.model';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private readonly CACHE_TTL_MINUTES = APP_CONFIG.cache.ttl.ratingsMinutes;
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

    const previousRating: number = this.ratedMoviesCache.get(movieId) || 0;
    this.ratedMoviesCache.set(movieId, rating);

    const request: AddRatingRequest = this.createRatingRequest(rating);

    return this.http
      .post<AddRatingResponse>(`/movie/${movieId}/rating`, request)
      .pipe(
        tap((): void => {
          this.invalidateRatingsCache();
        }),
        catchError((error: unknown): Observable<never> => {
          if (previousRating === 0) {
            this.ratedMoviesCache.delete(movieId);
          } else {
            this.ratedMoviesCache.set(movieId, previousRating);
          }
          return throwError(() => error);
        })
      );
  }

  private createRatingRequest(rating: number): AddRatingRequest {
    const request: AddRatingRequest = {
      value: rating,
    };
    return request;
  }

  removeRating(movieId: number): Observable<DeleteRatingResponse> {
    const previousRating: number = this.ratedMoviesCache.get(movieId) || 0;
    this.ratedMoviesCache.delete(movieId);

    return this.http
      .delete<DeleteRatingResponse>(`/movie/${movieId}/rating`)
      .pipe(
        tap((): void => {
          this.invalidateRatingsCache();
        }),
        catchError((error: unknown): Observable<never> => {
          if (previousRating > 0) {
            this.ratedMoviesCache.set(movieId, previousRating);
          }
          return throwError(() => error);
        })
      );
  }

  clearAllRatings(): Observable<DeleteRatingResponse[]> {
    return this.getRatedMovies(1).pipe(
      switchMap((firstPage: RatedMoviesResponse): Observable<number[]> => {
        const totalPages: number = firstPage.total_pages;

        if (totalPages === 0) {
          return of([]);
        }

        const pageRequests: Observable<RatedMoviesResponse>[] = [];
        for (let page = 1; page <= totalPages; page++) {
          pageRequests.push(this.getRatedMovies(page));
        }

        return forkJoin(pageRequests).pipe(
          map((allPages: RatedMoviesResponse[]): number[] => {
            const allMovieIds: number[] = [];
            allPages.forEach((pageResponse: RatedMoviesResponse): void => {
              pageResponse.results.forEach((movie: RatedMovie): void => {
                allMovieIds.push(movie.id);
              });
            });
            return allMovieIds;
          })
        );
      }),
      switchMap((movieIds: number[]): Observable<DeleteRatingResponse[]> => {
        if (movieIds.length === 0) {
          return of([]);
        }

        const deleteRequests: Observable<DeleteRatingResponse>[] = movieIds.map(
          (movieId: number): Observable<DeleteRatingResponse> =>
            this.removeRating(movieId)
        );

        return forkJoin(deleteRequests);
      }),
      tap((): void => {
        this.invalidateRatingsCache();
      })
    );
  }

  private invalidateRatingsCache(): void {
    this.cacheService.invalidateByPrefix(CachePrefix.RATINGS);
  }
}
