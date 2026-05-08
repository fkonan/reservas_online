import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { LoggingService } from "./logging.service";

const STUCK_THRESHOLD_MS = 30_000;

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = signal(0);
  isLoading = computed(() => this.activeRequests() > 0);

  constructor() {
    let stuckTimer: ReturnType<typeof setTimeout> | null = null;

    effect(() => {
      const loading = this.isLoading();
      if (loading) {
        stuckTimer = setTimeout(() => {
          if (this.isLoading()) {
            // inject lazy para evitar problemas de orden de inicialización
            inject(LoggingService).log({
              type: 'stuck_loading',
              message: `Spinner atascado por más de ${STUCK_THRESHOLD_MS / 1000}s`,
              extra: { activeRequests: this.activeRequests() },
            });
          }
        }, STUCK_THRESHOLD_MS);
      } else {
        if (stuckTimer !== null) {
          clearTimeout(stuckTimer);
          stuckTimer = null;
        }
      }
    });
  }

  show() {
    this.activeRequests.set(this.activeRequests() + 1);
  }

  hide() {
    if (this.activeRequests() > 0) {
      this.activeRequests.set(this.activeRequests() - 1);
    }
  }
}
