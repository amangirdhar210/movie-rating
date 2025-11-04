import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, map, forkJoin, of, tap } from 'rxjs';

import {
  Movie,
  FavouriteMoviesResponse,
  AddFavouriteRequest,
  AddFavouriteResponse,
} from '../models/app.models';
import { ACCOUNT_ID } from '../constants';
import { CacheService } from './cache.service';
import { CachePrefix } from '../models/cache.model';

@Injectable({
  providedIn: 'root',
})
export class FavouriteService {
  private readonly CACHE_TTL_MINUTES = 10;
  private favouriteMoviesCache: Set<number> = new Set();

  constructor(private http: HttpClient, private cacheService: CacheService) {}

  getFavourites(page: number = 1): Observable<FavouriteMoviesResponse> {
    const cacheKey: string = `${CachePrefix.FAVOURITES}_page_${page}`;
    const cachedData: FavouriteMoviesResponse | null =
      this.cacheService.retrieve<FavouriteMoviesResponse>(cacheKey);

    if (cachedData) {
      this.updateInMemoryCache(cachedData, page);
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
          this.cacheService.save(cacheKey, response, this.CACHE_TTL_MINUTES);
        })
      );
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

  private updateInMemoryCache(
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

  isFavourite(movieId: number): boolean {
    return this.favouriteMoviesCache.has(movieId);
  }

  addToFavourites(movieId: number): Observable<AddFavouriteResponse> {
    this.favouriteMoviesCache.add(movieId);

    const request: AddFavouriteRequest = {
      media_type: 'movie',
      media_id: movieId,
      favorite: true,
    };

    return this.http
      .post<AddFavouriteResponse>(`/account/${ACCOUNT_ID}/favorite`, request)
      .pipe(
        tap((): void => {
          this.invalidateFavouritesCache();
        })
      );
  }

  removeFromFavourites(movieId: number): Observable<AddFavouriteResponse> {
    this.favouriteMoviesCache.delete(movieId);

    const request: AddFavouriteRequest = {
      media_type: 'movie',
      media_id: movieId,
      favorite: false,
    };

    return this.http
      .post<AddFavouriteResponse>(`/account/${ACCOUNT_ID}/favorite`, request)
      .pipe(
        tap((): void => {
          this.invalidateFavouritesCache();
        })
      );
  }

  toggleFavourite(movieId: number): Observable<AddFavouriteResponse> {
    if (this.isFavourite(movieId)) {
      return this.removeFromFavourites(movieId);
    } else {
      return this.addToFavourites(movieId);
    }
  }

  clearAllFavourites(): Observable<AddFavouriteResponse[]> {
    const movieIds: number[] = Array.from(this.favouriteMoviesCache.values());

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

  private invalidateFavouritesCache(): void {
    this.cacheService.invalidateByPrefix(CachePrefix.FAVOURITES);
  }
}
