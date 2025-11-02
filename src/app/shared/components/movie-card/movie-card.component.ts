import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Movie } from '../../models/movie.model';
import { IMAGE_BASE_URL } from '../../constants';

@Component({
  selector: 'app-movie-card',
  imports: [CommonModule, CardModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  @Input() movie!: Movie;
  @Input() isFavourite = false;
  @Input() userRating: number = 0;
  @Output() movieClick = new EventEmitter<Movie>();

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

  onCardClick(): void {
    this.movieClick.emit(this.movie);
  }
}
