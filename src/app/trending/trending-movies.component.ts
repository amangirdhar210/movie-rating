import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';

import { MovieDataService } from '../shared/services/movie-data.service';
import { Movie, MovieRatingEvent } from '../shared/models/app.models';
import {
  PAGE_TITLE_TEXT,
  SEARCH_TEXT,
  EMPTY_STATE_TEXT,
  ERROR_TEXT,
  SUCCESS_TEXT,
} from '../shared/constants/app.constants';
import {
  PAGINATION_CONFIG,
  DEFAULT_CONFIG,
} from '../shared/constants/app.config';
import { MovieCardComponent } from '../shared/components/movie-card/movie-card.component';
import { MovieDetailModalComponent } from '../shared/components/movie-detail-modal/movie-detail-modal.component';

@Component({
  selector: 'app-trending-movies',
  imports: [
    FormsModule,
    MovieCardComponent,
    MovieDetailModalComponent,
    PaginatorModule,
    InputTextModule,
    ButtonModule,
    ProgressSpinnerModule,
    TooltipModule,
  ],
  templateUrl: './trending-movies.component.html',
  styleUrl: './trending-movies.component.scss',
})
export class TrendingMoviesComponent implements OnInit {
  movies: Movie[] = [];
  loading: WritableSignal<boolean> = signal<boolean>(false);
  isSearching: WritableSignal<boolean> = signal<boolean>(false);
  currentPage: number = 1;
  totalResults: number = 0;
  searchQuery: string = '';
  isSearchMode: boolean = false;
  selectedMovie: Movie | null = null;
  showModal: boolean = false;
  readonly TEXT = {
    ...PAGE_TITLE_TEXT,
    ...SEARCH_TEXT,
    ...EMPTY_STATE_TEXT,
    ...ERROR_TEXT,
    ...SUCCESS_TEXT,
  };
  readonly pageSize = PAGINATION_CONFIG.defaultPageSize;

  constructor(
    private movieDataService: MovieDataService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadTrendingMovies(1);
  }

  loadTrendingMovies(page: number = 1): void {
    this.loading.set(true);
    this.currentPage = page;
    this.isSearchMode = false;
    this.searchQuery = '';

    this.movieDataService
      .getTrendingMovies(DEFAULT_CONFIG.trendingTimeWindow, page)
      .subscribe({
        next: (response): void => {
          this.movies = response.results;
          this.totalResults = response.total_results;
          this.loading.set(false);
        },
        error: (): void => {
          this.messageService.add({
            severity: 'error',
            summary: this.TEXT.ERROR,
            detail: this.TEXT.ERROR_LOADING_TRENDING,
          });
          this.loading.set(false);
        },
      });
  }

  searchMovies(page: number = 1): void {
    if (!this.searchQuery.trim()) {
      this.loadTrendingMovies();
      return;
    }

    this.loading.set(true);
    this.isSearching.set(true);
    this.currentPage = page;
    this.isSearchMode = true;

    this.movieDataService.searchMovies(this.searchQuery, page).subscribe({
      next: (response): void => {
        this.movies = response.results;
        this.totalResults = response.total_results;
        this.loading.set(false);
        this.isSearching.set(false);
      },
      error: (): void => {
        this.messageService.add({
          severity: 'error',
          summary: this.TEXT.ERROR,
          detail: this.TEXT.ERROR_SEARCHING_MOVIES,
        });
        this.loading.set(false);
        this.isSearching.set(false);
      },
    });
  }

  onSearch(): void {
    this.searchMovies(1);
  }

  onPageChange(event: { page?: number }): void {
    const page = event.page !== undefined ? event.page + 1 : 1;
    if (this.isSearchMode) {
      this.searchMovies(page);
    } else {
      this.loadTrendingMovies(page);
    }
  }

  onMovieClick(movie: Movie): void {
    this.selectedMovie = movie;
    this.showModal = true;
  }

  onToggleFavourite(movie: Movie): void {
    this.movieDataService.toggleFavourite(movie.id).subscribe({
      next: (): void => {
        const isFavourite: boolean = this.movieDataService.isFavourite(
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
    const isRatingRemoved: boolean = event.rating === 0;
    this.movieDataService.setRating(event.movie.id, event.rating).subscribe({
      next: (): void => {
        this.messageService.add({
          severity: 'success',
          summary: this.TEXT.SUCCESS,
          detail: isRatingRemoved
            ? this.TEXT.SUCCESS_RATING_REMOVED
            : this.TEXT.SUCCESS_RATING_ADDED,
        });
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

  clearCacheAndReload(): void {
    this.movieDataService.clearCache();
    this.messageService.add({
      severity: 'success',
      summary: 'Cache Cleared',
      detail: 'Movie cache has been cleared successfully',
    });

    if (this.isSearchMode) {
      this.searchMovies(this.currentPage);
    } else {
      this.loadTrendingMovies(this.currentPage);
    }
  }
}
