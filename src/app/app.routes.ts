import { Routes } from '@angular/router';
import { TrendingMoviesComponent } from './trending/trending-movies.component';
import { MyCollectionComponent } from './my-collection/my-collection.component';

export const routes: Routes = [
  { path: '', redirectTo: '/trending', pathMatch: 'full' },
  { path: 'trending', component: TrendingMoviesComponent },
  { path: 'my-collection', component: MyCollectionComponent },
  { path: '**', redirectTo: '/trending' },
];
