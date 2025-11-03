import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { RatingService } from '../shared/services/rating.service';
import { FavouriteService } from '../shared/services/favourite.service';
import { Movie } from '../shared/models/movie.model';
import { APP_TEXT } from '../shared/constants';
import { MovieCardComponent } from '../shared/components/movie-card/movie-card.component';
import { MovieDetailModalComponent } from '../shared/components/movie-detail-modal/movie-detail-modal.component';
import { ButtonModule } from 'primeng/button';

type RatedMovie = Movie & { userRating: number };

@Component({
  selector: 'app-ratings',
  imports: [MovieCardComponent, MovieDetailModalComponent, ButtonModule],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.scss',
})
export class RatingsComponent implements OnInit {
  ratedMovies: WritableSignal<RatedMovie[]> = signal<RatedMovie[]>([]);
  selectedMovie: Movie | null = null;
  showModal = false;
  readonly TEXT = APP_TEXT;

  constructor(
    private ratingService: RatingService,
    private favouriteService: FavouriteService
  ) {}

  ngOnInit(): void {
    this.loadRatedMovies();
  }

  loadRatedMovies(): void {
    this.ratedMovies.set(this.ratingService.getRatedMovies());
  }

  onMovieClick(movie: Movie): void {
    this.selectedMovie = movie;
    this.showModal = true;
  }

  onToggleFavourite(movie: Movie): void {
    this.favouriteService.toggleFavourite(movie);
    this.loadRatedMovies();
  }

  onRateMovie(event: { movie: Movie; rating: number }): void {
    this.ratingService.setRating(event.movie.id, event.rating, event.movie);
    this.loadRatedMovies();
  }

  isFavourite(movieId: number): boolean {
    return this.favouriteService.isFavourite(movieId);
  }

  getUserRating(movieId: number): number {
    return this.ratingService.getRating(movieId);
  }

  clearAllRatings(): void {
    this.ratingService.clearAllRatings();
    this.loadRatedMovies();
  }
}
