# CineMate - Movie Rating Application

A modern, responsive movie browsing and rating application built with Angular 19, PrimeNG, and Tailwind CSS. Browse trending movies, search for your favorites, and maintain your personal collection with ratings.

## Features

- **Browse Trending Movies**: View the latest trending movies with detailed information
- **Advanced Search**: Search for any movie with real-time results
- **Movie Details Modal**: Click any movie to see comprehensive details including overview, ratings, and stats
- **Personal Ratings**: Rate movies on a 5-star scale
- **Favorites Management**: Add movies to your favorites for quick access
- **Fully Responsive**: Optimized for all devices from mobile to desktop
- **Modern UI**: Beautiful gradient design with smooth animations

## Tech Stack

- Angular 19.2
- PrimeNG 19.1 (UI Components)
- Tailwind CSS 4.1 (Styling)
- TMDB API (Movie Data)
- RxJS (State Management)
- TypeScript 5.7

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up your TMDB API credentials:
   - Copy `src/app/shared/environments/sampleEnvironment.ts` to `src/app/shared/environments/environment.ts`
   - Add your TMDB API key and access token

## Development

Start the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/`

## Building

Build for production:

```bash
ng build
```

## Project Structure

```
src/app/
├── favourites/              # Favourites page component
├── trending/                # Trending movies page component
├── navbar/                  # Navigation component
├── interceptors/            # HTTP interceptors
└── shared/
    ├── components/
    │   ├── movie-card/      # Movie card component
    │   ├── movie-detail-modal/  # Movie details modal
    │   └── paginator/       # Pagination component
    ├── services/
    │   ├── movie.service.ts    # Movie API service
    │   └── rating.service.ts   # Ratings & favorites service
    ├── models/              # TypeScript interfaces
    ├── constants/           # App constants
    └── environments/        # Environment configs
```

## Key Features Implementation

### Responsive Design

- Mobile-first approach with breakpoints for all screen sizes
- Adaptive grid layouts that adjust from 1-5 columns
- Touch-friendly UI elements
- Optimized images and lazy loading

### Movie Detail Modal

- Full movie information display
- Interactive rating system
- Add/remove from favorites
- Responsive backdrop and poster images
- Smooth animations and transitions

### Local Storage

- Favorites persisted locally
- User ratings saved across sessions
- No backend required for personal data

## API Integration

The app uses TMDB (The Movie Database) API:

- Trending movies endpoint
- Search movies endpoint
- Image CDN for posters and backdrops

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)


