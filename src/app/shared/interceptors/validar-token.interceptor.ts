import sha256 from 'crypto-js/hmac-sha256';
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/env.dev';

export const ValidarToken: HttpInterceptorFn = (req, next) => {
  const apiUrl = `${environment.baseUrl}`;

  const rutasExcluidas = [
    `${apiUrl}ciudades`,
    `${apiUrl}sedes`,
    `api/payment/abandon/`,
  ];

  const isExcluded = rutasExcluidas.some((route) => req.url.includes(route));
  if (isExcluded) {
    return next(req);
  }

  const APP_TOKEN = environment.APP_TOKEN;
  const method = req.method.toUpperCase();
  const path = new URL(req.url).pathname;
  const bodyStr = req.body ? JSON.stringify(req.body) : '';
  const message = method + path + bodyStr;
  const token = sha256(message, APP_TOKEN).toString();

  const authReq = req.clone({
    setHeaders: {
      'X-APP-TOKEN': token,
    },
  });
  return next(authReq);
};
