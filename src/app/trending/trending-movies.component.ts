import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../shared/services/movie.service';
import { RatingService } from '../shared/services/rating.service';
import { Movie } from '../shared/models/movie.model';
import { MovieCardComponent } from '../shared/components/movie-card/movie-card.component';
import { PaginatorComponent } from '../shared/components/paginator/paginator.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-trending-movies',
  imports: [
    CommonModule,
    FormsModule,
    MovieCardComponent,
    PaginatorComponent,
    InputTextModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './trending-movies.component.html',
  styleUrl: './trending-movies.component.scss',
})
export class TrendingMoviesComponent implements OnInit {
  movies: Movie[] = [];
  loading = false;
  currentPage = 1;
  totalResults = 0;
  searchQuery = '';
  isSearchMode = false;

  constructor(
    private movieService: MovieService,
    private ratingService: RatingService
  ) {}

  ngOnInit() {
    this.loadTrendingMovies();
  }

  loadTrendingMovies(page: number = 1) {
    this.loading = true;
    this.currentPage = page;
    this.isSearchMode = false;
    this.searchQuery = '';

    this.movieService.getTrendingMovies('week', page).subscribe({
      next: (response) => {
        this.movies = response.results;
        this.totalResults = response.total_results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trending movies:', error);
        this.loading = false;
      },
    });
  }

  searchMovies(page: number = 1) {
    if (!this.searchQuery.trim()) {
      this.loadTrendingMovies();
      return;
    }

    this.loading = true;
    this.currentPage = page;
    this.isSearchMode = true;

    this.movieService.searchMovies(this.searchQuery, page).subscribe({
      next: (response) => {
        this.movies = response.results;
        this.totalResults = response.total_results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching movies:', error);
        this.loading = false;
      },
    });
  }

  onSearch() {
    this.searchMovies(1);
  }

  onPageChange(page: number) {
    if (this.isSearchMode) {
      this.searchMovies(page);
    } else {
      this.loadTrendingMovies(page);
    }
  }

  onToggleFavourite(movie: Movie) {
    this.ratingService.toggleFavourite(movie);
  }

  onRateMovie(event: { movie: Movie; rating: number }) {
    this.ratingService.setRating(event.movie.id, event.rating);
  }

  isFavourite(movieId: number): boolean {
    return this.ratingService.isFavourite(movieId);
  }

  getUserRating(movieId: number): number {
    return this.ratingService.getRating(movieId);
  }
}
