import { ErrorHandler, inject, Injectable } from '@angular/core';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private loggingSvc = inject(LoggingService);

  handleError(error: unknown): void {
    // ResourceValueError y ResourceWrappedError de Angular envuelven el error real en .cause
    // Hay que navegar la cadena de .cause hasta llegar al error original
    const root = this.unwrapCause(error);

    const message = root instanceof Error ? root.message : String(root);
    const stack = root instanceof Error ? root.stack : undefined;
    const extra = root !== error
      ? { wrapper: error instanceof Error ? error.message : String(error) }
      : undefined;

    this.loggingSvc.log({ type: 'angular_error', message, stack, extra });

    console.error('[GlobalErrorHandler]', error);
  }

  private unwrapCause(error: unknown): unknown {
    let current = error;
    let depth = 0;
    while (current instanceof Error && (current as any).cause && depth < 5) {
      current = (current as any).cause;
      depth++;
    }
    return current;
  }
}
