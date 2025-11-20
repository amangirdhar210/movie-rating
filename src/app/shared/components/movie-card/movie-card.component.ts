import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe, UpperCasePipe } from '@angular/common';

import { CardModule } from 'primeng/card';

import { Movie, CommonTextType } from '../../models/app.models';
import {
  IMAGE_BASE_URL,
  DEFAULT_POSTER_PATH,
} from '../../constants/api.constants';
import { COMMON_TEXT } from '../../constants/app.constants';

@Component({
  selector: 'app-movie-card',
  imports: [CardModule, DecimalPipe, UpperCasePipe],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: Movie;
  @Input() isFavourite: boolean = false;
  @Input() userRating: number = 0;
  @Input() showFavouriteBadge: boolean = true;
  @Input() showRatingBadge: boolean = true;
  @Output() movieClick: EventEmitter<Movie> = new EventEmitter<Movie>();

  readonly imgBaseUrl: string = IMAGE_BASE_URL;
  readonly TEXT: CommonTextType = COMMON_TEXT;

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
