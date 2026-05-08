import { computed, inject, Injectable, signal } from "@angular/core";
import { LoggingService } from "./logging.service";

const STUCK_MS = 30_000;

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly loggingSvc = inject(LoggingService);
  private activeRequests = signal(0);
  private stuckTimer: ReturnType<typeof setTimeout> | null = null;
  isLoading = computed(() => this.activeRequests() > 0);

  show() {
    this.activeRequests.set(this.activeRequests() + 1);
    if (this.stuckTimer === null) {
      this.stuckTimer = setTimeout(() => {
        this.stuckTimer = null;
        if (this.isLoading()) {
          this.loggingSvc.log({
            type: 'stuck_loading',
            message: `Spinner atascado por más de ${STUCK_MS / 1000}s`,
            extra: { activeRequests: this.activeRequests() },
          });
        }
      }, STUCK_MS);
    }
  }

  hide() {
    if (this.activeRequests() > 0) {
      this.activeRequests.set(this.activeRequests() - 1);
    }
    if (!this.isLoading() && this.stuckTimer !== null) {
      clearTimeout(this.stuckTimer);
      this.stuckTimer = null;
    }
  }
}
