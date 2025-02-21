import { ServiciosService } from './../../../shared/services/servicios.service';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CardSedeComponent } from '../../../shared/components/card-sede/card-sede.component';
import { Router } from '@angular/router';
import { Sedes } from '../../../shared/models/sedes.model';
import { Servicios } from '../../../shared/models/servicios.model';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
// @ts-ignore
const $:any=window['$'];
@Component({
  selector: 'app-servicios',
  imports: [CardSedeComponent, TitleCasePipe, FormsModule, CommonModule],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss',
})
export class ServiciosComponent {
  @ViewChild('horariosModal') modal?: ElementRef;

  sede: Sedes;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.sede = navigation?.extras.state?.['sede'] || null;
  }

  servicios: Servicios[] = [];
  servicioSeleccionado = signal<Servicios | null>(null);
  selectedDate: string = '';
  serviciosService = inject(ServiciosService);
  readonly loading = signal<boolean>(false);

  ngOnInit() {
    if (this.serviciosService) {
      this.serviciosService.getServicios(this.sede.id).subscribe({
        next: (data) => (this.servicios = data),
        error: (err) => console.error('Error en componente:', err),
      });
    }
  }

  openModal(servicio: Servicios) {
    this.servicioSeleccionado.set(servicio);
    $(this.modal?.nativeElement).modal('show');
  }

  buscarAgenda() {
    if (this.selectedDate && this.servicioSeleccionado) {
      this.loading.set(true);
      const formattedDate = new Date(this.selectedDate).toISOString().split('T')[0];
      this.serviciosService
        .getHorarios(
          formattedDate,
          this.servicioSeleccionado()?.tipo_servicio_id!,
          this.servicioSeleccionado()?.id!,
        )
        .subscribe({
          next: (horarios) => {
            this.loading.set(false);
            // Aquí puedes manejar los horarios obtenidos, por ejemplo, abrir un modal con los horarios disponibles
            console.log('Horarios obtenidos:', horarios);
          },
          error: (err) => {
            this.loading.set(false);
            console.error('Error al obtener horarios:', err);
          },
        });
    } else {
      alert('Por favor, selecciona una fecha.');
    }
  }
}
