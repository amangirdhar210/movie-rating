import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingService } from '../shared/services/rating.service';
import { Movie } from '../shared/models/movie.model';
import { MovieCardComponent } from '../shared/components/movie-card/movie-card.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-favourite-movies',
  imports: [CommonModule, MovieCardComponent, ButtonModule],
  templateUrl: './favourite-movies.component.html',
  styleUrl: './favourite-movies.component.scss',
})
export class FavouriteMoviesComponent implements OnInit {
  favouriteMovies: Movie[] = [];

  constructor(private ratingService: RatingService) {}

  ngOnInit() {
    this.loadFavourites();
  }

  loadFavourites() {
    this.favouriteMovies = this.ratingService.getFavourites();
  }

  onToggleFavourite(movie: Movie) {
    this.ratingService.toggleFavourite(movie);
    this.loadFavourites(); 
  }

  onRateMovie(event: { movie: Movie; rating: number }) {
    this.ratingService.setRating(event.movie.id, event.rating);
  }

  isFavourite(movieId: number): boolean {
    return this.ratingService.isFavourite(movieId);
  }

  getUserRating(movieId: number): number {
    return this.ratingService.getRating(movieId);
  }

  clearAllFavourites() {
    if (confirm('Are you sure you want to remove all favourites?')) {
      this.favouriteMovies.forEach((movie) => {
        this.ratingService.removeFromFavourites(movie.id);
      });
      this.loadFavourites();
    }
  }
}
