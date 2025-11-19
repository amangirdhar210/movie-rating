export const COMMON_TEXT = {
  NO_OVERVIEW: 'No overview available.',
  YES: 'Yes',
  NO: 'No',
} as const;

export const MOVIE_DETAIL_TEXT = {
  OVERVIEW: 'Overview',
  POPULARITY: 'Popularity',
  ADULT_CONTENT: 'Adult Content',
  YOUR_RATING: 'Your Rating',
  ADD_TO_FAVOURITES: 'Add to Favourites',
  REMOVE_FROM_FAVOURITES: 'Remove from Favourites',
  VOTES: 'votes',
  CLEAR_RATING: 'Clear rating',
} as const;

export const PAGE_TITLE_TEXT = {
  TRENDING_MOVIES: 'Trending Movies',
  SEARCH_RESULTS: 'Search Results',
  MY_COLLECTION: 'My Collection',
} as const;

export const NAV_TEXT = {
  TRENDING: 'Trending',
  FAVOURITES: 'Favourites',
  MY_RATINGS_NAV: 'My Ratings',
  MY_COLLECTION_NAV: 'My Collection',
} as const;

export const SEARCH_TEXT = {
  SEARCH_PLACEHOLDER: 'Search for movies...',
  SEARCH: 'Search',
  CLEAR: 'Clear',
} as const;

export const ACTION_TEXT = {
  CLEAR_ALL_FAVOURITES: 'Clear All Favourites',
  CLEAR_ALL_RATINGS: 'Clear All Ratings',
} as const;

export const EMPTY_STATE_TEXT = {
  NO_MOVIES_FOUND: 'No movies found',
  NO_FAVOURITE_MOVIES: 'No favourite movies yet',
  NO_FAVOURITES_SUBTITLE:
    'Start adding movies to your favourites from the trending page!',
  NO_RATINGS_YET: 'No Ratings Yet',
  NO_RATINGS_SUBTITLE:
    "Start rating movies to see them here. Your ratings help you track movies you've watched!",
} as const;

export const ERROR_TEXT = {
  ERROR: 'Error',
  ERROR_LOADING_TRENDING: 'Failed to load trending movies',
  ERROR_SEARCHING_MOVIES: 'Failed to search movies',
  ERROR_LOADING_MOVIE_DETAILS: 'Failed to load movie details',
  ERROR_GENERIC: 'An error occurred. Please try again.',
  ERROR_LOADING_RATED_MOVIES: 'Failed to load rated movies',
  ERROR_LOADING_FAVOURITES: 'Failed to load favourites',
  ERROR_UPDATE_RATING: 'Failed to update rating',
  ERROR_UPDATE_FAVOURITE: 'Failed to update favourite',
  ERROR_CLEAR_RATINGS: 'Failed to clear ratings',
  ERROR_CLEAR_FAVOURITES: 'Failed to clear favourites',
} as const;

export const SUCCESS_TEXT = {
  SUCCESS: 'Success',
  SUCCESS_RATING_ADDED: 'Rating updated successfully',
  SUCCESS_RATING_REMOVED: 'Rating removed',
  SUCCESS_FAVOURITE_ADDED: 'Added to favourites',
  SUCCESS_FAVOURITE_REMOVED: 'Removed from favourites',
  SUCCESS_ALL_RATINGS_CLEARED: 'All ratings cleared',
  SUCCESS_ALL_FAVOURITES_CLEARED: 'All favourites cleared',
} as const;
