import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Movie } from '../../models/movie.model';
import { IMAGE_BASE_URL, APP_TEXT, DEFAULT_POSTER_PATH } from '../../constants';

@Component({
  selector: 'app-movie-card',
  imports: [CardModule, DecimalPipe, UpperCasePipe],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: Movie;
  @Input() isFavourite = false;
  @Input() userRating: number = 0;
  @Output() movieClick = new EventEmitter<Movie>();

  readonly imgBaseUrl = IMAGE_BASE_URL;
  readonly TEXT = APP_TEXT;

  get poster(): string {
    return this.movie.poster_path
      ? `${this.imgBaseUrl}${this.movie.poster_path}`
      : DEFAULT_POSTER_PATH;
  }

  get releaseYear(): string {
    return this.movie.release_date
      ? new Date(this.movie.release_date).getFullYear().toString()
      : '—';
  }

  onCardClick(): void {
    this.movieClick.emit(this.movie);
  }
}
