import {
  TrendingMoviesResponse,
  RatedMoviesResponse,
  FavouriteMoviesResponse,
} from './app.models';

export type CacheableResponse =
  | TrendingMoviesResponse
  | RatedMoviesResponse
  | FavouriteMoviesResponse;

export interface CacheData<T = CacheableResponse> {
  value: T;
  expiry: number;
}

export interface CacheStore {
  [key: string]: CacheData<CacheableResponse>;
}

export enum CachePrefix {
  TRENDING = 'trending',
  SEARCH = 'search',
  RATINGS = 'ratings',
  FAVOURITES = 'favourites',
}
