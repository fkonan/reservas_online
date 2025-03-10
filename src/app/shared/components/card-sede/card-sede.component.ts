import { Component, signal } from '@angular/core';
import { Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Sedes } from '../../../models/sedes.model';
import {RouterModule } from '@angular/router';
import { environment } from '../../../environments/env.dev';

@Component({
  selector: 'app-card-sede',
  imports: [MatCardModule, RouterModule],
  templateUrl: './card-sede.component.html',
  styleUrl: './card-sede.component.scss',
})
export class CardSedeComponent {
  @Input() sede!: Sedes;

  getImagenUrl(foto: string | null | undefined): string {
      return foto ? `${environment.baseUrl}storage/${foto}` : 'assets/imagen-default.jpg';
    }
}
