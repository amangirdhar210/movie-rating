export const API_CONFIG = {
  baseUrl: 'https://api.themoviedb.org/3/',
  accountId: '22427194',
  mediaType: 'movie',
} as const;

export const MEDIA_CONFIG = {
  imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
  defaultPosterPath: '/placeholder-poster.jpg',
} as const;

export const CACHE_CONFIG = {
  storageKey: 'movie_cache_store',
  cleanupIntervalMs: 120000,
  ttl: {
    trendingMinutes: 5,
    searchMinutes: 3,
    favouritesMinutes: 10,
    ratingsMinutes: 10,
  },
} as const;

export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
} as const;

export const DEFAULT_CONFIG = {
  trendingTimeWindow: 'week' as 'day' | 'week',
} as const;
