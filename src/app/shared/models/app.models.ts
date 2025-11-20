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

export interface RatedMovie extends Movie {
  rating?: number;
  userRating: number;
}

export interface MovieRatingEvent {
  movie: Movie;
  rating: number;
}

export interface RatedMoviesResponse {
  page: number;
  results: RatedMovie[];
  total_pages: number;
  total_results: number;
}

export interface FavouriteMoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface AddRatingRequest {
  value: number;
}

export interface AddRatingResponse {
  success: boolean;
  status_code: number;
  status_message: string;
}

export interface DeleteRatingResponse {
  success: boolean;
  status_code: number;
  status_message: string;
}

export interface AddFavouriteRequest {
  media_type: string;
  media_id: number;
  favorite: boolean;
}

export interface AddFavouriteResponse {
  success: boolean;
  status_code: number;
  status_message: string;
}

export interface ApiHeaders {
  [key: string]: string | string[];
  Accept: string;
  Authorization: string;
}

export interface PrimeNGThemeOptions {
  darkModeSelector: boolean;
}

export interface PrimeNGTheme {
  preset: Record<string, unknown>;
  options: PrimeNGThemeOptions;
}

export interface PrimeNGConfig {
  theme: PrimeNGTheme;
}

export interface PageChangeEvent {
  page?: number;
}

export type TabType = 'favourites' | 'ratings';

export interface CommonTextType {
  NO_OVERVIEW: string;
  YES: string;
  NO: string;
}

export interface MovieDetailTextType {
  OVERVIEW: string;
  POPULARITY: string;
  ADULT_CONTENT: string;
  YOUR_RATING: string;
  ADD_TO_FAVOURITES: string;
  REMOVE_FROM_FAVOURITES: string;
  VOTES: string;
  CLEAR_RATING: string;
}

export interface PageTitleTextType {
  TRENDING_MOVIES: string;
  SEARCH_RESULTS: string;
  MY_COLLECTION: string;
}

export interface NavTextType {
  TRENDING: string;
  FAVOURITES: string;
  MY_RATINGS_NAV: string;
  MY_COLLECTION_NAV: string;
}

export interface SearchTextType {
  SEARCH_PLACEHOLDER: string;
  SEARCH: string;
  CLEAR: string;
}

export interface ActionTextType {
  CLEAR_ALL_FAVOURITES: string;
  CLEAR_ALL_RATINGS: string;
}

export interface EmptyStateTextType {
  NO_MOVIES_FOUND: string;
  NO_FAVOURITE_MOVIES: string;
  NO_FAVOURITES_SUBTITLE: string;
  NO_RATINGS_YET: string;
  NO_RATINGS_SUBTITLE: string;
}

export interface ErrorTextType {
  ERROR: string;
  ERROR_LOADING_TRENDING: string;
  ERROR_SEARCHING_MOVIES: string;
  ERROR_LOADING_MOVIE_DETAILS: string;
  ERROR_GENERIC: string;
  ERROR_LOADING_RATED_MOVIES: string;
  ERROR_LOADING_FAVOURITES: string;
  ERROR_UPDATE_RATING: string;
  ERROR_UPDATE_FAVOURITE: string;
  ERROR_CLEAR_RATINGS: string;
  ERROR_CLEAR_FAVOURITES: string;
}

export interface SuccessTextType {
  SUCCESS: string;
  SUCCESS_RATING_ADDED: string;
  SUCCESS_RATING_REMOVED: string;
  SUCCESS_FAVOURITE_ADDED: string;
  SUCCESS_FAVOURITE_REMOVED: string;
  SUCCESS_ALL_RATINGS_CLEARED: string;
  SUCCESS_ALL_FAVOURITES_CLEARED: string;
}

export type CombinedTextType = PageTitleTextType &
  SearchTextType &
  EmptyStateTextType &
  ErrorTextType &
  SuccessTextType;

export type CollectionTextType = PageTitleTextType &
  NavTextType &
  ActionTextType &
  EmptyStateTextType &
  ErrorTextType &
  SuccessTextType;
