import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Router, RouterModule } from '@angular/router';
import { Sedes } from '../../../models/sedes.model';
import { ServiciosService } from '../../../shared/services/servicios.service';
import { SedesService } from '../../../shared/services/sedes.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-inicio',
  imports: [HeaderComponent, RouterModule, JsonPipe],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss',
})
export class InicioComponent {
  private sedesService = inject(SedesService);

  sede = this.sedesService.sedes;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
  }
}
