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
import { APP_TEXT, APP_CONFIG } from '../shared/constants';
import { MovieCardComponent } from '../shared/components/movie-card/movie-card.component';
import { MovieDetailModalComponent } from '../shared/components/movie-detail-modal/movie-detail-modal.component';
import { PaginatorComponent } from '../shared/components/paginator/paginator.component';

type TabType = 'favourites' | 'ratings';

@Component({
  selector: 'app-my-collection',
  imports: [
    MovieCardComponent,
    MovieDetailModalComponent,
    ButtonModule,
    ProgressSpinnerModule,
    PaginatorComponent,
  ],
  templateUrl: './my-collection.component.html',
  styleUrl: './my-collection.component.scss',
})
export class MyCollectionComponent implements OnInit {
  activeTab: WritableSignal<TabType> = signal<TabType>('favourites');
  favouriteMovies: WritableSignal<Movie[]> = signal<Movie[]>([]);
  ratedMovies: WritableSignal<RatedMovie[]> = signal<RatedMovie[]>([]);
  loading: WritableSignal<boolean> = signal<boolean>(false);
  isDeletingAll: WritableSignal<boolean> = signal<boolean>(false);
  currentPage: number = 1;
  totalResults: number = 0;
  selectedMovie: Movie | null = null;
  showModal: boolean = false;
  readonly TEXT = APP_TEXT;
  readonly pageSize = APP_CONFIG.pagination.defaultPageSize;

  constructor(
    private ratingService: RatingService,
    private favouriteService: FavouriteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadFavourites();
  }

  switchTab(tab: TabType): void {
    this.activeTab.set(tab);
    this.currentPage = 1;
    if (tab === 'favourites') {
      this.loadFavourites(1);
    } else {
      this.loadRatedMovies(1);
    }
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
    if (this.activeTab() === 'favourites') {
      this.loadFavourites(page);
    } else {
      this.loadRatedMovies(page);
    }
  }

  onMovieClick(movie: Movie): void {
    this.selectedMovie = movie;
    this.showModal = true;
  }

  onToggleFavourite(movie: Movie): void {
    const isFavourite: boolean = this.favouriteService.isFavourite(movie.id);

    this.favouriteService.toggleFavourite(movie.id).subscribe({
      next: (): void => {
        const isNowFavourite: boolean = this.favouriteService.isFavourite(
          movie.id
        );
        this.messageService.add({
          severity: 'success',
          summary: this.TEXT.SUCCESS,
          detail: isNowFavourite
            ? this.TEXT.SUCCESS_FAVOURITE_ADDED
            : this.TEXT.SUCCESS_FAVOURITE_REMOVED,
        });

        if (this.activeTab() === 'favourites' && isFavourite) {
          this.loadFavourites(this.currentPage);
          this.showModal = false;
        }
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

        if (this.activeTab() === 'ratings' && isRemovingRating) {
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

  onClearAll(): void {
    this.isDeletingAll.set(true);

    const clearObservable =
      this.activeTab() === 'favourites'
        ? this.favouriteService.clearAllFavourites()
        : this.ratingService.clearAllRatings();

    const successMessage =
      this.activeTab() === 'favourites'
        ? this.TEXT.SUCCESS_ALL_FAVOURITES_CLEARED
        : this.TEXT.SUCCESS_ALL_RATINGS_CLEARED;

    const errorMessage =
      this.activeTab() === 'favourites'
        ? this.TEXT.ERROR_CLEAR_FAVOURITES
        : this.TEXT.ERROR_CLEAR_RATINGS;

    clearObservable.subscribe({
      next: (): void => {
        this.messageService.add({
          severity: 'success',
          summary: this.TEXT.SUCCESS,
          detail: successMessage,
        });

        if (this.activeTab() === 'favourites') {
          this.loadFavourites(1);
        } else {
          this.loadRatedMovies(1);
        }

        this.isDeletingAll.set(false);
      },
      error: (): void => {
        this.messageService.add({
          severity: 'error',
          summary: this.TEXT.ERROR,
          detail: errorMessage,
        });
        this.isDeletingAll.set(false);
      },
    });
  }

  get currentMovies(): Movie[] {
    return this.activeTab() === 'favourites'
      ? this.favouriteMovies()
      : this.ratedMovies();
  }

  get emptyStateIcon(): string {
    return this.activeTab() === 'favourites' ? 'pi-heart' : 'pi-star';
  }

  get emptyStateTitle(): string {
    return this.activeTab() === 'favourites'
      ? this.TEXT.NO_FAVOURITE_MOVIES
      : this.TEXT.NO_RATINGS_YET;
  }

  get emptyStateSubtitle(): string {
    return this.activeTab() === 'favourites'
      ? this.TEXT.NO_FAVOURITES_SUBTITLE
      : this.TEXT.NO_RATINGS_SUBTITLE;
  }

  get clearAllButtonLabel(): string {
    return this.activeTab() === 'favourites'
      ? this.TEXT.CLEAR_ALL_FAVOURITES
      : this.TEXT.CLEAR_ALL_RATINGS;
  }
}
