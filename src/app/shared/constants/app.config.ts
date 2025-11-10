export const APP_CONFIG = {
  api: {
    baseUrl: 'https://api.themoviedb.org/3/',
    accountId: '22427194',
    mediaType: 'movie',
  },

  media: {
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
    defaultPosterPath: '/placeholder-poster.jpg',
  },

  cache: {
    storageKey: 'movie_cache_store',
    cleanupIntervalMs: 120000,
    ttl: {
      trendingMinutes: 5,
      searchMinutes: 3,
      favouritesMinutes: 10,
      ratingsMinutes: 10,
    },
  },

  pagination: {
    defaultPageSize: 20,
  },

  defaults: {
    trendingTimeWindow: 'week' as 'day' | 'week',
  },
} as const;
