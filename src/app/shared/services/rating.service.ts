import { Injectable } from '@angular/core';
import { Movie } from '../models/movie.model';

interface MovieRating {
  movieId: number;
  rating: number;
  movie: Movie;
}

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private readonly FAVOURITES_KEY = 'favourite_movies';
  private readonly RATINGS_KEY = 'movie_ratings';

  constructor() {}

  getFavourites(): Movie[] {
    const favourites = localStorage.getItem(this.FAVOURITES_KEY);
    return favourites ? JSON.parse(favourites) : [];
  }

  addToFavourites(movie: Movie): void {
    const favourites = this.getFavourites();
    if (!this.isFavourite(movie.id)) {
      favourites.push(movie);
      localStorage.setItem(this.FAVOURITES_KEY, JSON.stringify(favourites));
    }
  }

  removeFromFavourites(movieId: number): void {
    const favourites = this.getFavourites();
    const updated = favourites.filter((m) => m.id !== movieId);
    localStorage.setItem(this.FAVOURITES_KEY, JSON.stringify(updated));
  }

  isFavourite(movieId: number): boolean {
    return this.getFavourites().some((m) => m.id === movieId);
  }

  toggleFavourite(movie: Movie): void {
    if (this.isFavourite(movie.id)) {
      this.removeFromFavourites(movie.id);
    } else {
      this.addToFavourites(movie);
    }
  }

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
}
