import { TrendingMoviesResponse } from './movie.model';

export interface CacheData {
  value: TrendingMoviesResponse;
  expiry: number;
}

export interface CacheStore {
  [key: string]: CacheData;
}
