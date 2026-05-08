import { Component, inject, DestroyRef } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { LoggingService } from './shared/services/logging.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'reservas_online';

  constructor() {
    localStorage.removeItem('servicio');
    localStorage.removeItem('valorAbono');

    const router = inject(Router);
    const destroyRef = inject(DestroyRef);
    const loggingSvc = inject(LoggingService);

    const onError = (e: ErrorEvent) => loggingSvc.log({
      type: 'js_error',
      message: e.message,
      stack: e.error?.stack,
      extra: { filename: e.filename, lineno: e.lineno, colno: e.colno },
    });

    const onUnhandledRejection = (e: PromiseRejectionEvent) => loggingSvc.log({
      type: 'promise_rejection',
      message: e.reason instanceof Error ? e.reason.message : String(e.reason),
      stack: e.reason instanceof Error ? e.reason.stack : undefined,
    });

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    destroyRef.onDestroy(() => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    });

    router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(() => {
        const scrollTop = () => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        };
        scrollTop();
        requestAnimationFrame(scrollTop);
        setTimeout(scrollTop, 0);
        setTimeout(scrollTop, 50);
      });
  }
}
