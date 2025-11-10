import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe, UpperCasePipe } from '@angular/common';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';

import { Movie, MovieRatingEvent } from '../../models/app.models';
import { IMAGE_BASE_URL, APP_TEXT, DEFAULT_POSTER_PATH } from '../../constants';

@Component({
  selector: 'app-movie-detail-modal',
  imports: [
    DialogModule,
    ButtonModule,
    RatingModule,
    FormsModule,
    TagModule,
    DecimalPipe,
    UpperCasePipe,
  ],
  templateUrl: './movie-detail-modal.component.html',
  styleUrl: './movie-detail-modal.component.scss',
})
export class MovieDetailModalComponent {
  @Input() visible = false;
  @Input() movie: Movie | null = null;
  @Input() isFavourite = false;
  @Input() userRating = 0;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() toggleFavourite = new EventEmitter<Movie>();
  @Output() rateMovie = new EventEmitter<MovieRatingEvent>();

  readonly imgBaseUrl = IMAGE_BASE_URL;
  readonly TEXT = APP_TEXT;

  get backdropUrl(): string {
    if (this.movie?.backdrop_path) {
      return `${this.imgBaseUrl}${this.movie.backdrop_path}`;
    }
    if (this.movie?.poster_path) {
      return `${this.imgBaseUrl}${this.movie.poster_path}`;
    }
    return DEFAULT_POSTER_PATH;
  }

  get posterUrl(): string {
    return this.movie?.poster_path
      ? `${this.imgBaseUrl}${this.movie.poster_path}`
      : DEFAULT_POSTER_PATH;
  }

  get releaseYear(): string {
    return this.movie?.release_date
      ? new Date(this.movie.release_date).getFullYear().toString()
      : '—';
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }

  onToggleFavourite(): void {
    if (this.movie) {
      this.toggleFavourite.emit(this.movie);
    }
  }

  onRateChange(): void {
    if (this.movie) {
      const ratingEvent: MovieRatingEvent = {
        movie: this.movie,
        rating: this.userRating,
      };
      this.rateMovie.emit(ratingEvent);
    }
  }

  clearRating(): void {
    this.userRating = 0;
    if (this.movie) {
      const ratingEvent: MovieRatingEvent = {
        movie: this.movie,
        rating: 0,
      };
      this.rateMovie.emit(ratingEvent);
    }
  }
}
