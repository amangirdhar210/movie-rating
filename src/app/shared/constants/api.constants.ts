import { environment } from '../environments/environment';
import { APP_CONFIG } from './app.config';

export const BASE_API_URL = APP_CONFIG.api.baseUrl;

export const IMAGE_BASE_URL = APP_CONFIG.media.imageBaseUrl;

export const DEFAULT_POSTER_PATH = APP_CONFIG.media.defaultPosterPath;

export const API_KEY = environment.movieApiKey;

export const API_READ_ACCESS_TOKEN = environment.movieApiAccssToken;

export const ACCOUNT_ID = APP_CONFIG.api.accountId;
