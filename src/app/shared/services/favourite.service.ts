import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, map, forkJoin, of } from 'rxjs';

import {
  Movie,
  FavouriteMoviesResponse,
  AddFavouriteRequest,
  AddFavouriteResponse,
} from '../models/movie.model';
import { ACCOUNT_ID } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class FavouriteService {
  private favouriteMoviesCache: Set<number> = new Set();

  constructor(private http: HttpClient) {}

  getFavourites(page: number = 1): Observable<FavouriteMoviesResponse> {
    return this.http
      .get<FavouriteMoviesResponse>(
        `/account/${ACCOUNT_ID}/favorite/movies?page=${page}`
      )
      .pipe(
        map((response: FavouriteMoviesResponse): FavouriteMoviesResponse => {
          if (page === 1) {
            this.favouriteMoviesCache.clear();
          }

          response.results.forEach((movie: Movie) => {
            this.favouriteMoviesCache.add(movie.id);
          });

          return response;
        })
      );
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
        map((response: AddFavouriteResponse): AddFavouriteResponse => {
          return response;
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
        map((response: AddFavouriteResponse): AddFavouriteResponse => {
          return response;
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

    return forkJoin(removeRequests);
  }
}
