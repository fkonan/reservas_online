import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.services';
import { finalize } from 'rxjs';
import { HttpInterceptorFn } from '@angular/common/http';

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingSvc = inject(LoadingService);
  loadingSvc.show();
  return next(req).pipe(finalize(() => loadingSvc.hide()));
};
