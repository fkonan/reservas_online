import { CiudadesService } from './../../../shared/services/ciudades.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Ciudades } from '../../../models/ciudades.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { SedesService } from '../../../shared/services/sedes.service';
import { Sedes } from '../../../shared/models/sedes.model';

@Component({
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  ciudades: Ciudades[] = [];
  sedes: Sedes[] = [];
  ciudadesService = inject(CiudadesService);
  sedesService = inject(SedesService);
  readonly loading = signal<boolean>(false);

  ngOnInit() {
    if (this.ciudadesService) {
      this.ciudadesService.getCiudades().subscribe({
        next: (data) => (this.ciudades = data),
        error: (err) => console.error('Error en componente:', err),
      });
    }
  }

  onCiudadSelected(event: any) {
    const ciudad: Ciudades = event.option.value;
    this.sedesService.getSedes(ciudad.id).subscribe({
      next: (data) => (this.sedes = data),
      error: (err) => console.error('Error en componente:', err),
    });
  }
}
