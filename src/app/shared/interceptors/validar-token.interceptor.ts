import sha256 from 'crypto-js/hmac-sha256';
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/env.dev';

export const ValidarToken: HttpInterceptorFn = (req, next) => {
  let apiUrl = `${environment.baseUrl}`;

  let rutasExcluidas = [`${apiUrl}ciudades`, `${apiUrl}sedes`];

  const isExcluded = rutasExcluidas.some((route) => req.url.includes(route));
  if (isExcluded) {
    return next(req);
  }
  const APP_TOKEN = environment.APP_TOKEN;
  const payload = req.body ? JSON.stringify(req.body) : '';
  const token = sha256(payload, APP_TOKEN).toString();
  const authReq = req.clone({
    setHeaders: {
      'X-APP-TOKEN': token,
    },
  });
  return next(authReq);
};
