import { Routes } from '@angular/router';
import { TrendingMoviesComponent } from './trending/trending-movies.component';
import { FavouriteMoviesComponent } from './favourites/favourite-movies.component';

export const routes: Routes = [
  { path: '', redirectTo: '/trending', pathMatch: 'full' },
  { path: 'trending', component: TrendingMoviesComponent },
  { path: 'favourites', component: FavouriteMoviesComponent },
  { path: '**', redirectTo: '/trending' },
];
