import { environment } from '../environments/environment';
import { API_CONFIG, MEDIA_CONFIG } from './app.config';

export const BASE_API_URL = API_CONFIG.baseUrl;

export const IMAGE_BASE_URL = MEDIA_CONFIG.imageBaseUrl;

export const DEFAULT_POSTER_PATH = MEDIA_CONFIG.defaultPosterPath;

export const API_READ_ACCESS_TOKEN = environment.movieApiAccssToken;

export const ACCOUNT_ID = API_CONFIG.accountId;
