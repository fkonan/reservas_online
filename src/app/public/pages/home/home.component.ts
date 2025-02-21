import { CiudadesService } from './../../../shared/services/ciudades.service';
import { Component,  inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Ciudades } from '../../../models/ciudades.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CardSedesComponent } from '../../../shared/components/card-sedes/card-sedes.component';

@Component({
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CardSedesComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {

  ciudades: Ciudades[] = [];
  ciudadSeleccionada = signal<Ciudades | null>(null);

  ciudadesService = inject(CiudadesService);
  readonly loading = signal<boolean>(false);

  ngOnInit() {
    if (this.ciudadesService) {
      this.ciudadesService.getCiudades().subscribe({
        next: (data) => (this.ciudades = data),
        error: (err) => console.error('Error en componente:', err),
      });
    }
  }
}
