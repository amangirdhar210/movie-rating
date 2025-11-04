import {
  TrendingMoviesResponse,
  RatedMoviesResponse,
  FavouriteMoviesResponse,
} from './movie.model';

export interface CacheData<
  T = TrendingMoviesResponse | RatedMoviesResponse | FavouriteMoviesResponse
> {
  value: T;
  expiry: number;
}

export interface CacheStore {
  [key: string]: CacheData<any>;
}

export enum CachePrefix {
  TRENDING = 'trending',
  SEARCH = 'search',
  RATINGS = 'ratings',
  FAVOURITES = 'favourites',
}

export interface CacheConfig {
  ttlMinutes: number;
  prefix: CachePrefix;
}
