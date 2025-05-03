import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { ValidarPagoService } from '../../../shared/services/validar-pago.service';

@Component({
  selector: 'app-validar-pago',
  imports: [],
  templateUrl: './validar-pago.component.html',
  styleUrl: './validar-pago.component.scss',
})
export class ValidarPagoComponent implements OnInit {
  constructor(private route: ActivatedRoute, private validarPagoService: ValidarPagoService) {}

  mensaje: string = 'Validando pago...';
  data: any = null;
  status: string = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const link = params.get('bold-order-id');
      if (link) {
        this.validarPagoService.validarPago(link).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.data = response.data;
              this.mensaje = response.message;
              this.status = response.data.status;
            }
          },
          error: (error) => {
            console.error('Error al validar el pago:', error);
            alert('Error al validar el pago');
          },
        });
      } else {
        alert('No se encontró el parámetro "link" en la ruta');
      }
    });
  }
}
