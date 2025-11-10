import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { BASE_API_URL, API_READ_ACCESS_TOKEN } from '../shared/constants';
import { ApiHeaders } from '../shared/models/app.models';

export const tmdbAPIInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (req.url.startsWith('/')) {
    const headers: ApiHeaders = {
      Accept: 'application/json',
      Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`,
    };

    const updatedRequest: HttpRequest<unknown> = req.clone({
      url: `${BASE_API_URL}${req.url.replace(/^\//, '')}`,
      setHeaders: headers,
    });

    return next(updatedRequest);
  }

  return next(req);
};
