import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientesService } from '../../../shared/services/clientes.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AgendaService } from '../../../shared/services/agenda.service';
import Swal from 'sweetalert2';
import { HeaderPromoComponent } from '../../../shared/components/header-promo/header-promo.component';
import { SeasonalTreeBottomComponent } from '../../../shared/components/seasonal-tree-bottom/seasonal-tree-bottom.component';

@Component({
  selector: 'app-detalle-pago',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, RouterModule, HeaderPromoComponent, SeasonalTreeBottomComponent],
  templateUrl: './detalle-pago.component.html',
  styleUrl: './detalle-pago.component.scss',
})
export class DetallePagoComponent {
  form: FormGroup;
  private clienteService = inject(ClientesService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
  private agendaService = inject(AgendaService);

  display: boolean = true; // Control de visibilidad de campos
  protected readonly datosCita = signal<any>(null); // Datos de la cita
  nombreMostrar: string = '';
  recomendacionesHTML: SafeHtml = '';

  constructor() {
    // Obtener datos del estado de la navegación
    const datos = history.state?.['datosCita'];

    if (datos) {
      this.datosCita.set(datos);
      // Extraer recomendaciones desde el nuevo modelo (secciones[]) con fallback al campo legado
      const seccionRec = datos.servicio?.web?.secciones?.find(
        (s: any) => s.tipo_seccion === 'recomendaciones'
      );
      const items: string[] = seccionRec?.contenido_json?.items ?? [];
      const html = items.length
        ? `<ul>${items.map((i: string) => `<li>${i}</li>`).join('')}</ul>`
        : (datos.servicio?.recomendaciones || '');
      this.recomendacionesHTML = this.sanitizer.bypassSecurityTrustHtml(html);
    }

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
      const cita = this.datosCita();
      if (!cita) return;

      const datosCita = {
        tipo_servicio: cita.servicio.tipo_servicio_id,
        servicio: cita.servicio.id,
        sede: cita.sede,
        fecha: cita.fecha,
        hora: cita.hora,
        documento: this.form.get('documento')?.value,
        nombres: this.form.get('nombres')?.value,
        apellidos: this.form.get('apellidos')?.value,
        telefono: this.form.get('telefono')?.value,
        correo: this.form.get('correo')?.value,
        fecha_nacimiento: this.form.get('fecha_nacimiento')?.value
          ? new Date(this.form.get('fecha_nacimiento')?.value).toISOString().split('T')[0]
          : undefined,
        valor_abono: cita.valor_abono,
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
      // Marcar todos los campos como touched para mostrar errores
      this.form.markAllAsTouched();
    }
  }

  validarDocumento() {
    this.nombreMostrar ='';
    const documento = this.form.get('documento')?.value;

    // Verifica si el documento tiene al menos 8 caracteres
    if (!documento || documento.length < 8) {
      this.display = true; // Oculta los campos si el documento es inválido
      return;
    }

    // Siempre muestra los campos después de validar el documento
    this.display = false;
    this.clienteService.actualizarDocumento(documento);
  }

  eff = effect(() => {
    const data = this.clienteService.cliente();
    const cita = this.datosCita();

    if (data && data.length > 0) {
      // Cliente existe - prellenar datos pero mantener campos visibles
      const cliente = Array.isArray(data) ? data[0] : data;
      this.nombreMostrar = `Hola ${cliente.nombres} ${cliente.apellidos}`;
      this.form.patchValue({
        nombres: cliente.nombres || '',
        apellidos: cliente.apellidos || '',
        telefono: cliente.telefono || '',
        correo: cliente.correo || '',
        fecha_nacimiento: cliente.fecha_nacimiento ? new Date(cliente.fecha_nacimiento) : null,
        valor_abono: cita?.valor_abono,
      });
      // Mantener campos visibles
      this.display = false;
    } else {
      // Cliente no existe - mostrar campos vacíos
      if (this.clienteService.documento()) {
        this.display = false;
        this.form.reset({
          documento: this.clienteService.documento(),
          valor_abono: cita?.valor_abono,
        });
      }
    }
  });
}
