import {
  Component,
  OnInit,
  signal,
  WritableSignal,
  ChangeDetectorRef,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

import { APP_TEXT } from '../shared/constants';
import { RatingService } from '../shared/services/rating.service';
import { FavouriteService } from '../shared/services/favourite.service';
import { Movie, MovieRatingEvent } from '../shared/models/movie.model';
import { MovieCardComponent } from '../shared/components/movie-card/movie-card.component';
import { MovieDetailModalComponent } from '../shared/components/movie-detail-modal/movie-detail-modal.component';
import { PaginatorComponent } from '../shared/components/paginator/paginator.component';

@Component({
  selector: 'app-favourite-movies',
  imports: [
    MovieCardComponent,
    MovieDetailModalComponent,
    ButtonModule,
    ProgressSpinnerModule,
    PaginatorComponent,
  ],
  templateUrl: './favourite-movies.component.html',
  styleUrl: './favourite-movies.component.scss',
})
export class FavouriteMoviesComponent implements OnInit {
  favouriteMovies: WritableSignal<Movie[]> = signal<Movie[]>([]);
  loading: WritableSignal<boolean> = signal<boolean>(false);
  currentPage = 1;
  totalResults = 0;
  selectedMovie: Movie | null = null;
  showModal = false;
  readonly TEXT = APP_TEXT;

  constructor(
    private ratingService: RatingService,
    private favouriteService: FavouriteService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRatings();
    this.loadFavourites();
  }

  loadRatings(): void {
    this.ratingService.getRatedMovies().subscribe();
  }

  loadFavourites(page: number = 1): void {
    this.loading.set(true);
    this.currentPage = page;

    this.favouriteService.getFavourites(page).subscribe({
      next: (response) => {
        this.favouriteMovies.set(response.results);
        this.totalResults = response.total_results;
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.TEXT.ERROR,
          detail: this.TEXT.ERROR_LOADING_FAVOURITES,
        });
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.loadFavourites(page);
  }

  onMovieClick(movie: Movie): void {
    this.selectedMovie = movie;
    this.showModal = true;
  }

  onToggleFavourite(movie: Movie): void {
    this.favouriteService.toggleFavourite(movie.id).subscribe({
      next: (): void => {
        this.messageService.add({
          severity: 'success',
          summary: this.TEXT.SUCCESS,
          detail: this.TEXT.SUCCESS_FAVOURITE_REMOVED,
        });
        this.loadFavourites(this.currentPage);
        this.showModal = false;
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
    const isRatingRemoved: boolean = event.rating === 0;
    this.ratingService.setRating(event.movie.id, event.rating).subscribe({
      next: (): void => {
        this.messageService.add({
          severity: 'success',
          summary: this.TEXT.SUCCESS,
          detail: isRatingRemoved
            ? this.TEXT.SUCCESS_RATING_REMOVED
            : this.TEXT.SUCCESS_RATING_ADDED,
        });
        this.cdr.detectChanges();
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

  clearAllFavourites(): void {
    this.favouriteService.clearAllFavourites().subscribe({
      next: (): void => {
        this.messageService.add({
          severity: 'success',
          summary: this.TEXT.SUCCESS,
          detail: this.TEXT.SUCCESS_ALL_FAVOURITES_CLEARED,
        });
        this.loadFavourites(1);
      },
      error: (): void => {
        this.messageService.add({
          severity: 'error',
          summary: this.TEXT.ERROR,
          detail: this.TEXT.ERROR_CLEAR_FAVOURITES,
        });
      },
    });
  }
}
