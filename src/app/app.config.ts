import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { tmdbAPIInterceptor } from './interceptors/api.interceptor';
import {
  PrimeNGConfig,
  PrimeNGTheme,
  PrimeNGThemeOptions,
} from './shared/models/app.models';

const primeNGThemeOptions: PrimeNGThemeOptions = {
  darkModeSelector: false,
};

const primeNGTheme: PrimeNGTheme = {
  preset: Aura,
  options: primeNGThemeOptions,
};

const primeNGConfig: PrimeNGConfig = {
  theme: primeNGTheme,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([tmdbAPIInterceptor])),
    MessageService,
    providePrimeNG(primeNGConfig),
  ],
};
