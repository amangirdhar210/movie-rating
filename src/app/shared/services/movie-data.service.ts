import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, forkJoin, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import {
  Movie,
  RatedMovie,
  TrendingMoviesResponse,
  RatedMoviesResponse,
  FavouriteMoviesResponse,
  AddRatingRequest,
  AddRatingResponse,
  DeleteRatingResponse,
  AddFavouriteRequest,
  AddFavouriteResponse,
} from '../models/app.models';
import { CacheService } from './cache.service';
import { CachePrefix } from '../models/cache.model';
import { ACCOUNT_ID } from '../constants/api.constants';
import { API_CONFIG, CACHE_CONFIG } from '../constants/app.config';

@Injectable({
  providedIn: 'root',
})
export class MovieDataService {
  private readonly TRENDING_CACHE_TTL_MINUTES: number =
    CACHE_CONFIG.ttl.trendingMinutes;
  private readonly SEARCH_CACHE_TTL_MINUTES: number =
    CACHE_CONFIG.ttl.searchMinutes;
  private readonly FAVOURITES_CACHE_TTL_MINUTES: number =
    CACHE_CONFIG.ttl.favouritesMinutes;
  private readonly RATINGS_CACHE_TTL_MINUTES: number =
    CACHE_CONFIG.ttl.ratingsMinutes;

  private favouriteMoviesCache: Set<number> = new Set();
  private ratedMoviesCache: Map<number, number> = new Map();

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

  getFavourites(page: number = 1): Observable<FavouriteMoviesResponse> {
    const cacheKey: string = `${CachePrefix.FAVOURITES}_page_${page}`;
    const cachedData: FavouriteMoviesResponse | null =
      this.cacheService.retrieve<FavouriteMoviesResponse>(cacheKey);

    if (cachedData) {
      this.updateFavouritesInMemoryCache(cachedData, page);
      return of(cachedData);
    }

    return this.http
      .get<FavouriteMoviesResponse>(
        `/account/${ACCOUNT_ID}/favorite/movies?page=${page}`
      )
      .pipe(
        map((response: FavouriteMoviesResponse): FavouriteMoviesResponse => {
          return this.processFavouriteMoviesResponse(response, page);
        }),
        tap((response: FavouriteMoviesResponse): void => {
          this.cacheService.save(
            cacheKey,
            response,
            this.FAVOURITES_CACHE_TTL_MINUTES
          );
        })
      );
  }

  getRatedMovies(page: number = 1): Observable<RatedMoviesResponse> {
    const cacheKey: string = `${CachePrefix.RATINGS}_page_${page}`;
    const cachedData: RatedMoviesResponse | null =
      this.cacheService.retrieve<RatedMoviesResponse>(cacheKey);

    if (cachedData) {
      this.updateRatingsInMemoryCache(cachedData, page);
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
          this.cacheService.save(
            cacheKey,
            response,
            this.RATINGS_CACHE_TTL_MINUTES
          );
        })
      );
  }

  isFavourite(movieId: number): boolean {
    return this.favouriteMoviesCache.has(movieId);
  }

  getRating(movieId: number): number {
    return this.ratedMoviesCache.get(movieId) || 0;
  }

  toggleFavourite(movieId: number): Observable<AddFavouriteResponse> {
    if (this.isFavourite(movieId)) {
      return this.removeFromFavourites(movieId);
    } else {
      return this.addToFavourites(movieId);
    }
  }

  setRating(movieId: number, rating: number): Observable<AddRatingResponse> {
    if (rating === 0) {
      return this.removeRating(movieId);
    }

    const previousRating: number = this.ratedMoviesCache.get(movieId) || 0;
    this.ratedMoviesCache.set(movieId, rating);

    const request: AddRatingRequest = { value: rating };

    return this.http
      .post<AddRatingResponse>(`/movie/${movieId}/rating`, request)
      .pipe(
        tap((): void => {
          this.invalidateRatingsCache();
        }),
        catchError((error: Error): Observable<never> => {
          if (previousRating === 0) {
            this.ratedMoviesCache.delete(movieId);
          } else {
            this.ratedMoviesCache.set(movieId, previousRating);
          }
          return throwError(() => error);
        })
      );
  }

  clearAllFavourites(): Observable<AddFavouriteResponse[]> {
    const movieIds: number[] = Array.from(this.favouriteMoviesCache);

    if (movieIds.length === 0) {
      return of([]);
    }

    const removeRequests: Observable<AddFavouriteResponse>[] = movieIds.map(
      (movieId: number): Observable<AddFavouriteResponse> =>
        this.removeFromFavourites(movieId)
    );

    return forkJoin(removeRequests).pipe(
      tap((): void => {
        this.invalidateFavouritesCache();
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

  clearCache(): void {
    this.cacheService.clearAll();
  }

  private processFavouriteMoviesResponse(
    response: FavouriteMoviesResponse,
    page: number
  ): FavouriteMoviesResponse {
    if (page === 1) {
      this.favouriteMoviesCache.clear();
    }

    response.results.forEach((movie: Movie): void => {
      this.favouriteMoviesCache.add(movie.id);
    });

    return response;
  }

  private updateFavouritesInMemoryCache(
    response: FavouriteMoviesResponse,
    page: number
  ): void {
    if (page === 1) {
      this.favouriteMoviesCache.clear();
    }

    response.results.forEach((movie: Movie): void => {
      this.favouriteMoviesCache.add(movie.id);
    });
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

  private updateRatingsInMemoryCache(
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

  private addToFavourites(movieId: number): Observable<AddFavouriteResponse> {
    const wasAlreadyFavourite: boolean = this.favouriteMoviesCache.has(movieId);
    this.favouriteMoviesCache.add(movieId);

    const request: AddFavouriteRequest = {
      media_type: API_CONFIG.mediaType,
      media_id: movieId,
      favorite: true,
    };

    return this.http
      .post<AddFavouriteResponse>(`/account/${ACCOUNT_ID}/favorite`, request)
      .pipe(
        tap((): void => {
          this.invalidateFavouritesCache();
        }),
        catchError((error: Error): Observable<never> => {
          if (!wasAlreadyFavourite) {
            this.favouriteMoviesCache.delete(movieId);
          }
          return throwError(() => error);
        })
      );
  }

  private removeFromFavourites(
    movieId: number
  ): Observable<AddFavouriteResponse> {
    const wasAlreadyFavourite: boolean = this.favouriteMoviesCache.has(movieId);
    this.favouriteMoviesCache.delete(movieId);

    const request: AddFavouriteRequest = {
      media_type: API_CONFIG.mediaType,
      media_id: movieId,
      favorite: false,
    };

    return this.http
      .post<AddFavouriteResponse>(`/account/${ACCOUNT_ID}/favorite`, request)
      .pipe(
        tap((): void => {
          this.invalidateFavouritesCache();
        }),
        catchError((error: Error): Observable<never> => {
          if (wasAlreadyFavourite) {
            this.favouriteMoviesCache.add(movieId);
          }
          return throwError(() => error);
        })
      );
  }

  private removeRating(movieId: number): Observable<DeleteRatingResponse> {
    const previousRating: number = this.ratedMoviesCache.get(movieId) || 0;
    this.ratedMoviesCache.delete(movieId);

    return this.http
      .delete<DeleteRatingResponse>(`/movie/${movieId}/rating`)
      .pipe(
        tap((): void => {
          this.invalidateRatingsCache();
        }),
        catchError((error: Error): Observable<never> => {
          if (previousRating > 0) {
            this.ratedMoviesCache.set(movieId, previousRating);
          }
          return throwError(() => error);
        })
      );
  }

  private invalidateFavouritesCache(): void {
    this.cacheService.invalidateByPrefix(CachePrefix.FAVOURITES);
  }

  private invalidateRatingsCache(): void {
    this.cacheService.invalidateByPrefix(CachePrefix.RATINGS);
  }
}
