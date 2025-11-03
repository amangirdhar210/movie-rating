import { Component, OnInit, signal, WritableSignal } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { APP_TEXT } from '../shared/constants';
import { RatingService } from '../shared/services/rating.service';
import { FavouriteService } from '../shared/services/favourite.service';
import { Movie, MovieRatingEvent } from '../shared/models/movie.model';
import { MovieCardComponent } from '../shared/components/movie-card/movie-card.component';
import { MovieDetailModalComponent } from '../shared/components/movie-detail-modal/movie-detail-modal.component';

@Component({
  selector: 'app-favourite-movies',
  imports: [MovieCardComponent, MovieDetailModalComponent, ButtonModule],
  templateUrl: './favourite-movies.component.html',
  styleUrl: './favourite-movies.component.scss',
})
export class FavouriteMoviesComponent implements OnInit {
  favouriteMovies: WritableSignal<Movie[]> = signal<Movie[]>([]);
  selectedMovie: Movie | null = null;
  showModal = false;
  readonly TEXT = APP_TEXT;

  constructor(
    private ratingService: RatingService,
    private favouriteService: FavouriteService
  ) {}

  ngOnInit(): void {
    this.loadFavourites();
  }

  loadFavourites(): void {
    this.favouriteMovies.set(this.favouriteService.getFavourites());
  }

  onMovieClick(movie: Movie): void {
    this.selectedMovie = movie;
    this.showModal = true;
  }

  onToggleFavourite(movie: Movie): void {
    this.favouriteService.toggleFavourite(movie);
    this.loadFavourites();
  }

  onRateMovie(event: MovieRatingEvent): void {
    this.ratingService.setRating(event.movie.id, event.rating, event.movie);
  }

  isFavourite(movieId: number): boolean {
    return this.favouriteService.isFavourite(movieId);
  }

  getUserRating(movieId: number): number {
    return this.ratingService.getRating(movieId);
  }

  clearAllFavourites(): void {
    this.favouriteService.clearAllFavourites();
    this.loadFavourites();
  }
}
