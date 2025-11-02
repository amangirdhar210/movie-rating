import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie.model';

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
  constructor(private http: HttpClient) {}

  getTrendingMovies(
    timeWindow: 'day' | 'week' = 'week',
    page: number = 1
  ): Observable<TrendingMoviesResponse> {
    return this.http.get<TrendingMoviesResponse>(
      `/trending/movie/${timeWindow}?page=${page}`
    );
  }

  searchMovies(
    query: string,
    page: number = 1
  ): Observable<TrendingMoviesResponse> {
    return this.http.get<TrendingMoviesResponse>(
      `/search/movie?query=${encodeURIComponent(query)}&page=${page}`
    );
  }
}
