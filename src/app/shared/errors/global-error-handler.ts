import { ErrorHandler, inject, Injectable } from '@angular/core';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private loggingSvc = inject(LoggingService);

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    this.loggingSvc.log({ type: 'angular_error', message, stack });

    console.error('[GlobalErrorHandler]', error);
  }
}
