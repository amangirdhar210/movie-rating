import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';

import { MovieDataService } from '../shared/services/movie-data.service';
import {
  Movie,
  RatedMovie,
  MovieRatingEvent,
  RatedMoviesResponse,
  PageChangeEvent,
  TabType,
  CollectionTextType,
} from '../shared/models/app.models';
import {
  PAGE_TITLE_TEXT,
  NAV_TEXT,
  ACTION_TEXT,
  EMPTY_STATE_TEXT,
  ERROR_TEXT,
  SUCCESS_TEXT,
} from '../shared/constants/app.constants';
import { PAGINATION_CONFIG } from '../shared/constants/app.config';
import { MovieCardComponent } from '../shared/components/movie-card/movie-card.component';
import { MovieDetailModalComponent } from '../shared/components/movie-detail-modal/movie-detail-modal.component';

@Component({
  selector: 'app-my-collection',
  imports: [
    MovieCardComponent,
    MovieDetailModalComponent,
    ButtonModule,
    ProgressSpinnerModule,
    PaginatorModule,
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
  readonly TEXT: CollectionTextType = {
    ...PAGE_TITLE_TEXT,
    ...NAV_TEXT,
    ...ACTION_TEXT,
    ...EMPTY_STATE_TEXT,
    ...ERROR_TEXT,
    ...SUCCESS_TEXT,
  };
  readonly pageSize: number = PAGINATION_CONFIG.defaultPageSize;

  constructor(
    private movieDataService: MovieDataService,
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

    this.movieDataService.getFavourites(page).subscribe({
      next: (response): void => {
        this.favouriteMovies.set(response.results);
        this.totalResults = response.total_results;
        this.loading.set(false);
      },
      error: (): void => {
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

    this.movieDataService.getRatedMovies(page).subscribe({
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

  onPageChange(event: PageChangeEvent): void {
    const page: number = event.page !== undefined ? event.page + 1 : 1;
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
    const isFavourite: boolean = this.movieDataService.isFavourite(movie.id);

    this.movieDataService.toggleFavourite(movie.id).subscribe({
      next: (): void => {
        const isNowFavourite: boolean = this.movieDataService.isFavourite(
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

    this.movieDataService.setRating(event.movie.id, event.rating).subscribe({
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
    return this.movieDataService.isFavourite(movieId);
  }

  getUserRating(movieId: number): number {
    return this.movieDataService.getRating(movieId);
  }

  onClearAll(): void {
    this.isDeletingAll.set(true);

    const clearObservable: Observable<any[]> =
      this.activeTab() === 'favourites'
        ? this.movieDataService.clearAllFavourites()
        : this.movieDataService.clearAllRatings();

    const successMessage: string =
      this.activeTab() === 'favourites'
        ? this.TEXT.SUCCESS_ALL_FAVOURITES_CLEARED
        : this.TEXT.SUCCESS_ALL_RATINGS_CLEARED;

    const errorMessage: string =
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
