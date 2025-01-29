import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../services/loading.services';

@Component({
  selector: 'app-loading',
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
})
export class LoadingComponent {
  private readonly loading = inject(LoadingService);
  isLoading = this.loading.isLoading;
}
