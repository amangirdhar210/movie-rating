import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_API_URL, API_READ_ACCESS_TOKEN } from '../shared/constants';

export const tmdbAPIInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (req.url.startsWith('/')) {
    const updatedRequest = req.clone({
      url: `${BASE_API_URL}${req.url.replace(/^\//, '')}`,
      setHeaders: {
        Accept: 'application/json',
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`,
      },
    });

    return next(updatedRequest);
  }

  return next(req);
};
