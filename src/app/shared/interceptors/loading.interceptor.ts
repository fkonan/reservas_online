import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, finalize, throwError } from 'rxjs';
import { LoadingService } from '../services/loading.services';
import { LoggingService } from '../services/logging.service';

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingSvc = inject(LoadingService);
  const loggingSvc = inject(LoggingService);

  loadingSvc.show();

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      loggingSvc.log({
        type: 'http_error',
        message: `HTTP ${error.status} ${req.method} ${req.url}`,
        httpDetails: {
          method: req.method,
          requestUrl: req.url,
          status: error.status,
          statusText: error.statusText,
        },
      });
      return throwError(() => error);
    }),
    finalize(() => loadingSvc.hide()),
  );
};
