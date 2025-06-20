import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientesService } from '../../../shared/services/clientes.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AgendaService } from '../../../shared/services/agenda.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-pago',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './detalle-pago.component.html',
  styleUrl: './detalle-pago.component.scss',
})
export class DetallePagoComponent {
  form: FormGroup;
  private clienteService = inject(ClientesService);
  display: boolean = true; // Control de visibilidad de campos
  datosCita: any = null; // Datos de la cita
  recomendacionesHTML: SafeHtml;
  private agendaService = inject(AgendaService);

  constructor(private router: Router, private fb: FormBuilder, private sanitizer: DomSanitizer) {
    const navigation = this.router.getCurrentNavigation();
    this.datosCita = navigation?.extras.state?.['datosCita'];

    const html = this.datosCita.servicio.recomendaciones;
    this.recomendacionesHTML = this.sanitizer.bypassSecurityTrustHtml(html);

    this.form = this.fb.group({
      documento: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      fecha_nacimiento: [''],
      telefono: [''],
      correo: ['', [Validators.email]],
    });
  }

  onSubmit() {
    if (this.form.valid) {

      const datosCita = {
        tipo_servicio: this.datosCita.servicio.tipo_servicio_id,
        servicio: this.datosCita.servicio.id,
        sede: this.datosCita.sede,
        fecha: this.datosCita.fecha,
        hora: this.datosCita.hora,
        documento: this.form.get('documento')?.value,
        nombres: this.form.get('nombres')?.value,
        apellidos: this.form.get('apellidos')?.value,
        telefono: this.form.get('telefono')?.value,
        correo: this.form.get('correo')?.value,
        fecha_nacimiento: this.form.get('fecha_nacimiento')?.value
          ? new Date(this.form.get('fecha_nacimiento')?.value).toISOString().split('T')[0]
          : undefined,
        valor_abono: this.datosCita.valor_abono,
      };
      this.agendaService.generatePaymentLink(datosCita).subscribe({
        next: (response) => {

        },
        error: (err) => {
          // Mostrar toast de error aquí también
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error.message || 'Error al generar el link de pago',
          });
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }

  validarDocumento() {
    const documento = this.form.get('documento')?.value;

    // Verifica si el documento tiene al menos 8 caracteres
    if (!documento || documento.length < 8) {
      this.display = true; // Muestra los campos si el documento es inválido
      return;
    }

    this.clienteService.actualizarDocumento(documento);
  }

  eff = effect(() => {
    const data = this.clienteService.cliente();
    if (data && data.length > 0) {
      const cliente = Array.isArray(data) ? data[0] : data;
      this.form.patchValue({
        nombres: cliente.nombres || '',
        apellidos: cliente.apellidos || '',
        telefono: cliente.telefono || '',
        correo: cliente.correo || '',
        fecha_nacimiento: cliente.fecha_nacimiento ? new Date(cliente.fecha_nacimiento) : null,
        valor_abono: this.datosCita.valor_abono,
      });
      this.display = true;
    } else {
      if (this.clienteService.documento()) {
        this.display = false;
        this.form.reset({
          documento: this.clienteService.documento(),
          valor_abono: this.datosCita.valor_abono,
        });
      }
    }
  });
}
