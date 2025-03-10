import { SedesService } from './../../services/sedes.service';
import { Component,  inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { environment } from '../../../environments/env.dev';

@Component({
  selector: 'app-card-sedes',
  imports: [MatCardModule, RouterModule, JsonPipe],
  templateUrl: './card-sedes.component.html',
  styleUrl: './card-sedes.component.scss',
})
export class CardSedesComponent {
  private sedesService = inject(SedesService);

  ciudadSeleccionada = this.sedesService.ciudadSeleccionada;
  sedes = this.sedesService.sedes;
  error = this.sedesService.error;

  getImagenUrl(foto: string | null | undefined): string {
    return foto ? `${environment.baseUrl}storage/${foto}` : 'assets/imagen-default.jpg';
  }
}
