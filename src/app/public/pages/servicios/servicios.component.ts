import { ServiciosService } from './../../../shared/services/servicios.service';
import { Component, ElementRef, inject, Signal, signal, ViewChild } from '@angular/core';
import { CardSedeComponent } from '../../../shared/components/card-sede/card-sede.component';
import { Router } from '@angular/router';
import { Sedes } from '../../../models/sedes.model';
import { Servicios, TipoServicio } from '../../../models/servicios.model';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
// @ts-ignore
const $: any = window['$'];
@Component({
  selector: 'app-servicios',
  imports: [
    CardSedeComponent,
    TitleCasePipe,
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss',
})
export class ServiciosComponent  {
  @ViewChild('horariosModal') modal?: ElementRef;
  private servicioService = inject(ServiciosService);
  // Obtener los datos del servicio como signals
  tipoServicios: Signal<TipoServicio[]> = this.servicioService.tipoServicios;
  servicios: Signal<Servicios[]> = this.servicioService.servicios;
  error: Signal<string | null> = this.servicioService.error;

  tipoServicioSelect = signal<number | null>(null);

  sede: Sedes;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.sede = navigation?.extras.state?.['sede'] || null;
  }

  onTipoServicioChange(tipoId: number) {
    this.tipoServicioSelect.set(tipoId);
    if (tipoId) {
      this.servicioService.loadServicios(this.sede.id, tipoId);
    }
  }
}
