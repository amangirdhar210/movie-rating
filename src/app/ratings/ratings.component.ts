import { Component, OnInit, signal, WritableSignal } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

import { RatingService } from '../shared/services/rating.service';
import { FavouriteService } from '../shared/services/favourite.service';
import {
  Movie,
  RatedMovie,
  MovieRatingEvent,
  RatedMoviesResponse,
} from '../shared/models/app.models';
import { APP_TEXT } from '../shared/constants';
import { MovieCardComponent } from '../shared/components/movie-card/movie-card.component';
import { MovieDetailModalComponent } from '../shared/components/movie-detail-modal/movie-detail-modal.component';
import { PaginatorComponent } from '../shared/components/paginator/paginator.component';

@Component({
  selector: 'app-ratings',
  imports: [
    MovieCardComponent,
    MovieDetailModalComponent,
    ButtonModule,
    ProgressSpinnerModule,
    PaginatorComponent,
  ],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.scss',
})
export class RatingsComponent implements OnInit {
  ratedMovies: WritableSignal<RatedMovie[]> = signal<RatedMovie[]>([]);
  loading: WritableSignal<boolean> = signal<boolean>(false);
  currentPage: number = 1;
  totalResults: number = 0;
  selectedMovie: Movie | null = null;
  showModal: boolean = false;
  readonly TEXT = APP_TEXT;

  constructor(
    private ratingService: RatingService,
    private favouriteService: FavouriteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadFavourites();
    this.loadRatedMovies();
  }

  loadFavourites(): void {
    this.favouriteService.getFavourites().subscribe();
  }

  loadRatedMovies(page: number = 1): void {
    this.loading.set(true);
    this.currentPage = page;

    this.ratingService.getRatedMovies(page).subscribe({
      next: (response: RatedMoviesResponse): void => {
        this.ratedMovies.set(response.results);
        this.totalResults = response.total_results;
        this.loading.set(false);
      },
      error: (): void => {
        this.messageService.add({
          severity: 'error',
          summary: this.TEXT.ERROR,
          detail: this.TEXT.ERROR_LOADING_RATED_MOVIES,
        });
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.loadRatedMovies(page);
  }

  onMovieClick(movie: Movie): void {
    this.selectedMovie = movie;
    this.showModal = true;
  }

  onToggleFavourite(movie: Movie): void {
    this.favouriteService.toggleFavourite(movie.id).subscribe({
      next: (): void => {
        const isFavourite: boolean = this.favouriteService.isFavourite(
          movie.id
        );
        this.messageService.add({
          severity: 'success',
          summary: this.TEXT.SUCCESS,
          detail: isFavourite
            ? this.TEXT.SUCCESS_FAVOURITE_ADDED
            : this.TEXT.SUCCESS_FAVOURITE_REMOVED,
        });
      },
      error: (): void => {
        this.messageService.add({
          severity: 'error',
          summary: this.TEXT.ERROR,
          detail: this.TEXT.ERROR_UPDATE_FAVOURITE,
        });
      },
    });
  }

  onRateMovie(event: MovieRatingEvent): void {
    const isRemovingRating: boolean = event.rating === 0;

    this.ratingService.setRating(event.movie.id, event.rating).subscribe({
      next: (): void => {
        this.messageService.add({
          severity: 'success',
          summary: this.TEXT.SUCCESS,
          detail: isRemovingRating
            ? this.TEXT.SUCCESS_RATING_REMOVED
            : this.TEXT.SUCCESS_RATING_ADDED,
        });

        if (isRemovingRating) {
          this.showModal = false;
          this.loadRatedMovies(this.currentPage);
        }
      },
      error: (): void => {
        this.messageService.add({
          severity: 'error',
          summary: this.TEXT.ERROR,
          detail: this.TEXT.ERROR_UPDATE_RATING,
        });
      },
    });
  }

  isFavourite(movieId: number): boolean {
    return this.favouriteService.isFavourite(movieId);
  }

  getUserRating(movieId: number): number {
    return this.ratingService.getRating(movieId);
  }

  clearAllRatings(): void {
    this.ratingService.clearAllRatings().subscribe({
      next: (): void => {
        this.messageService.add({
          severity: 'success',
          summary: this.TEXT.SUCCESS,
          detail: this.TEXT.SUCCESS_ALL_RATINGS_CLEARED,
        });
        this.loadRatedMovies(1);
      },
      error: (): void => {
        this.messageService.add({
          severity: 'error',
          summary: this.TEXT.ERROR,
          detail: this.TEXT.ERROR_CLEAR_RATINGS,
        });
      },
    });
  }
}
