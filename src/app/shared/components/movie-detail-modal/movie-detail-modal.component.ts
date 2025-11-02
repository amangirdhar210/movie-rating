import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { Movie } from '../../models/movie.model';
import { IMAGE_BASE_URL } from '../../constants';

@Component({
  selector: 'app-movie-detail-modal',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    RatingModule,
    FormsModule,
    TagModule,
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
  @Output() rateMovie = new EventEmitter<{ movie: Movie; rating: number }>();

  readonly imgBaseUrl = IMAGE_BASE_URL;

  get backdropUrl(): string {
    if (this.movie?.backdrop_path) {
      return `${this.imgBaseUrl}${this.movie.backdrop_path}`;
    }
    if (this.movie?.poster_path) {
      return `${this.imgBaseUrl}${this.movie.poster_path}`;
    }
    return '/placeholder-poster.jpg';
  }

  get posterUrl(): string {
    return this.movie?.poster_path
      ? `${this.imgBaseUrl}${this.movie.poster_path}`
      : '/placeholder-poster.jpg';
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
      this.rateMovie.emit({ movie: this.movie, rating: this.userRating });
    }
  }

  clearRating(): void {
    this.userRating = 0;
    if (this.movie) {
      this.rateMovie.emit({ movie: this.movie, rating: 0 });
    }
  }
}
