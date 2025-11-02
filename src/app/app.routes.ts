import { Routes } from '@angular/router';
import { TrendingMoviesComponent } from './trending/trending-movies.component';
import { FavouriteMoviesComponent } from './favourites/favourite-movies.component';
import { RatingsComponent } from './ratings/ratings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/trending', pathMatch: 'full' },
  { path: 'trending', component: TrendingMoviesComponent },
  { path: 'favourites', component: FavouriteMoviesComponent },
  { path: 'ratings', component: RatingsComponent },
  { path: '**', redirectTo: '/trending' },
];
