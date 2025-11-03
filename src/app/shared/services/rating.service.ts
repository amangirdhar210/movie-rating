import { Injectable } from '@angular/core';
import { Movie, MovieRating } from '../models/movie.model';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private readonly RATINGS_KEY = 'movie_ratings';

  getRatings(): MovieRating[] {
    const ratings = localStorage.getItem(this.RATINGS_KEY);
    return ratings ? JSON.parse(ratings) : [];
  }

  getRating(movieId: number): number {
    const ratings = this.getRatings();
    const rating = ratings.find((r) => r.movieId === movieId);
    return rating ? rating.rating : 0;
  }

  setRating(movieId: number, rating: number, movie?: Movie): void {
    if (rating === 0) {
      this.removeRating(movieId);
      return;
    }

    const ratings = this.getRatings();
    const existingIndex = ratings.findIndex((r) => r.movieId === movieId);

    if (existingIndex !== -1) {
      ratings[existingIndex].rating = rating;
      if (movie) {
        ratings[existingIndex].movie = movie;
      }
    } else {
      if (movie) {
        ratings.push({ movieId, rating, movie });
      } else {
        ratings.push({ movieId, rating, movie: {} as Movie });
      }
    }

    localStorage.setItem(this.RATINGS_KEY, JSON.stringify(ratings));
  }

  removeRating(movieId: number): void {
    const ratings = this.getRatings();
    const updated = ratings.filter((r) => r.movieId !== movieId);
    localStorage.setItem(this.RATINGS_KEY, JSON.stringify(updated));
  }

  getRatedMovies(): Array<Movie & { userRating: number }> {
    const ratings = this.getRatings();
    const ratedMovies: Array<Movie & { userRating: number }> = [];

    ratings.forEach((rating) => {
      if (rating.movie && rating.movie.id) {
        ratedMovies.push({ ...rating.movie, userRating: rating.rating });
      }
    });

    return ratedMovies.sort((a, b) => b.userRating - a.userRating);
  }

  clearAllRatings(): void {
    localStorage.removeItem(this.RATINGS_KEY);
  }
}
