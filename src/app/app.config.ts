import { ApplicationConfig, ErrorHandler, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { GlobalErrorHandler } from './shared/errors/global-error-handler';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { LoadingInterceptor } from './shared/interceptors/loading.interceptor';
import { ValidarToken } from './shared/interceptors/validar-token.interceptor';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import localeEsCo from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    { provide: 'DEFAULT_CURRENCY_CODE', useValue: 'COP' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: LOCALE_ID, useValue: 'es-CO' }, // ✅ Idioma español
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withFetch(), withInterceptors([LoadingInterceptor, ValidarToken])),
  ],
};
