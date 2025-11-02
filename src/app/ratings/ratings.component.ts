import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingService } from '../shared/services/rating.service';
import { Movie } from '../shared/models/movie.model';
import { MovieCardComponent } from '../shared/components/movie-card/movie-card.component';
import { MovieDetailModalComponent } from '../shared/components/movie-detail-modal/movie-detail-modal.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-ratings',
  imports: [
    CommonModule,
    MovieCardComponent,
    MovieDetailModalComponent,
    ButtonModule,
  ],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.scss',
})
export class RatingsComponent implements OnInit {
  ratedMovies: Array<Movie & { userRating: number }> = [];
  selectedMovie: Movie | null = null;
  showModal = false;

  constructor(private ratingService: RatingService) {}

  ngOnInit(): void {
    this.loadRatedMovies();
  }

  loadRatedMovies(): void {
    this.ratedMovies = this.ratingService.getRatedMovies();
  }

  onMovieClick(movie: Movie): void {
    this.selectedMovie = movie;
    this.showModal = true;
  }

  onToggleFavourite(movie: Movie): void {
    this.ratingService.toggleFavourite(movie);
    this.loadRatedMovies();
  }

  onRateMovie(event: { movie: Movie; rating: number }): void {
    this.ratingService.setRating(event.movie.id, event.rating, event.movie);
    this.loadRatedMovies();
  }

  isFavourite(movieId: number): boolean {
    return this.ratingService.isFavourite(movieId);
  }

  getUserRating(movieId: number): number {
    return this.ratingService.getRating(movieId);
  }

  clearAllRatings(): void {
    this.ratedMovies.forEach((movie) => {
      this.ratingService.removeRating(movie.id);
    });
    this.loadRatedMovies();
  }
}
