import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';

import { Movie } from '../../models/movie.model';
import { IMAGE_BASE_URL } from '../../constants';
@Component({
  selector: 'app-movie-card',
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule,
    RatingModule,
    TagModule,
    FormsModule,
    CardModule,
  ],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  @Input() movie!: Movie;
  @Input() isFavourite = false;
  @Input() userRating: number = 0;
  @Output() toggleFavourite = new EventEmitter<Movie>();
  @Output() rateMovie = new EventEmitter<{ movie: Movie; rating: number }>();

  readonly imgBaseUrl = IMAGE_BASE_URL;

  get poster(): string {
    return this.movie.poster_path
      ? `${this.imgBaseUrl}${this.movie.poster_path}`
      : '/placeholder-poster.jpg';
  }

  get releaseYear(): string {
    return this.movie.release_date
      ? new Date(this.movie.release_date).getFullYear().toString()
      : '—';
  }

  onToggleFavourite(event: MouseEvent) {
    event.stopPropagation();
    this.toggleFavourite.emit(this.movie);
  }

  onRateChange() {
    this.rateMovie.emit({ movie: this.movie, rating: this.userRating });
  }
}
