import { SedesService } from './../../../shared/services/sedes.service';
import { Ciudades } from './../../../models/ciudades.model';
import { CiudadesService } from './../../../shared/services/ciudades.service';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CardSedesComponent } from '../../../shared/components/card-sedes/card-sedes.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Router } from '@angular/router';

@Component({
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    HeaderComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private isInitialLoad = true;
  constructor(private router: Router) {
    // this.seleccionarCiudad({ id: 1, ciudad: 'BUCARAMANGA' });
    effect(() => {
      const sedes = this.sedesService.sedes();
      const ciudadSeleccionada = this.sedesService.ciudadSeleccionada();

      if (this.isInitialLoad && ciudadSeleccionada && sedes.length > 0) {
        this.isInitialLoad = false;
        this.router.navigate(['/inicio'], { state: { sede: sedes[0] } });
      }
    });
  }

  ngOnInit() {
    const ciudadSeleccionada = this.sedesService.ciudadSeleccionada();
    if (ciudadSeleccionada) {
      this.isInitialLoad = false;
      this.sedesService.ciudadSeleccionada.set(undefined);
    }
    setTimeout(() => {
      this.isInitialLoad = false;
    }, 0);
  }

  private ciudadesService = inject(CiudadesService);
  private sedesService = inject(SedesService);

  ciudades = this.ciudadesService.ciudades;
  error = this.ciudadesService.error;

  seleccionarCiudad(ciudad: Ciudades) {
    this.sedesService.ciudadSeleccionada.set(ciudad);
    this.isInitialLoad = true;
  }
}
