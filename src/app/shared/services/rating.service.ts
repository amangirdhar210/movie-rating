import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, map, forkJoin, of } from 'rxjs';

import {
  RatedMovie,
  RatedMoviesResponse,
  AddRatingRequest,
  AddRatingResponse,
  DeleteRatingResponse,
} from '../models/movie.model';
import { ACCOUNT_ID } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private ratedMoviesCache: Map<number, number> = new Map();

  constructor(private http: HttpClient) {}

  getRatedMovies(page: number = 1): Observable<RatedMoviesResponse> {
    return this.http
      .get<RatedMoviesResponse>(
        `/account/${ACCOUNT_ID}/rated/movies?page=${page}`
      )
      .pipe(
        map((response: RatedMoviesResponse): RatedMoviesResponse => {
          if (page === 1) {
            this.ratedMoviesCache.clear();
          }

          response.results.forEach((movie: RatedMovie) => {
            const rating: number = movie.rating || movie.userRating || 0;
            this.ratedMoviesCache.set(movie.id, rating);
            movie.userRating = rating;
          });

          response.results.sort(
            (a: RatedMovie, b: RatedMovie): number =>
              b.userRating - a.userRating
          );

          return response;
        })
      );
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
        map((response: AddRatingResponse): AddRatingResponse => {
          return response;
        })
      );
  }

  removeRating(movieId: number): Observable<DeleteRatingResponse> {
    this.ratedMoviesCache.delete(movieId);

    return this.http
      .delete<DeleteRatingResponse>(`/movie/${movieId}/rating`)
      .pipe(
        map((response: DeleteRatingResponse): DeleteRatingResponse => {
          return response;
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

    return forkJoin(deleteRequests);
  }
}
