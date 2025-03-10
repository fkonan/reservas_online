import { computed, Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = signal(0);
  isLoading = computed(() => this.activeRequests() > 0);

  show() {
    this.activeRequests.set(this.activeRequests() + 1);
  }

  hide() {
    if (this.activeRequests() > 0) {
      this.activeRequests.set(this.activeRequests() - 1);
    }
  }
}
