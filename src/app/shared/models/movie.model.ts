export interface Movie {
  adult: boolean;
  backdrop_path: string | null;
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  media_type: string;
  original_language: string;
  genre_ids: number[];
  popularity: number;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface TrendingMoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieRating {
  movieId: number;
  rating: number;
  movie: Movie;
}

export interface RatedMovie extends Movie {
  userRating: number;
}
