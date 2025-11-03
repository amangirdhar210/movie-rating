import { Injectable } from '@angular/core';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root',
})
export class FavouriteService {
  private readonly FAVOURITES_KEY = 'favourite_movies';

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

  clearAllFavourites(): void {
    localStorage.removeItem(this.FAVOURITES_KEY);
  }
}
