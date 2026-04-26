import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
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
import { environment } from '../../../environments/env.dev';

@Component({
  selector: 'app-detalle-pago',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, RouterModule, HeaderPromoComponent, SeasonalTreeBottomComponent],
  templateUrl: './detalle-pago.component.html',
  styleUrl: './detalle-pago.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetallePagoComponent {
  form: FormGroup;
  private clienteService = inject(ClientesService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
  private agendaService = inject(AgendaService);
  protected readonly today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  /** null = sin buscar | true = cliente existe | false = cliente nuevo */
  protected readonly clienteExistente = signal<boolean | null>(null);
  protected readonly datosCita = signal<any>(null);
  protected readonly cargandoCliente = signal(false);
  nombreMostrar = '';
  recomendacionesHTML: SafeHtml = '';

  constructor() {
    const datos = history.state?.['datosCita'];

    if (datos) {
      this.datosCita.set(datos);
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
      whatsapp: [''],
      correo: ['', [Validators.email]],
      ciudad: [''],
      direccion: [''],
    });

    // Auto-sincronizar whatsapp con telefono
    this.form.get('telefono')!.valueChanges.subscribe((val) => {
      this.form.get('whatsapp')!.setValue(val, { emitEvent: false });
    });
  }

  /** Actualiza validators según si el cliente existe o es nuevo */
  private readonly clienteEffect = effect(() => {
    const existente = this.clienteExistente();
    if (existente === null) return;

    const camposNuevoCliente = ['fecha_nacimiento', 'telefono', 'whatsapp', 'correo', 'ciudad', 'direccion'];

    if (existente) {
      // Cliente existente: solo documento, nombres, apellidos son requeridos
      camposNuevoCliente.forEach((campo) => {
        this.form.get(campo)!.clearValidators();
        this.form.get(campo)!.updateValueAndValidity({ emitEvent: false });
      });
    } else {
      // Cliente nuevo: todos los campos obligatorios (excepto direccion que puede ser opcional si se quiere)
      this.form.get('fecha_nacimiento')!.setValidators(Validators.required);
      this.form.get('telefono')!.setValidators(Validators.required);
      this.form.get('whatsapp')!.setValidators(Validators.required);
      this.form.get('correo')!.setValidators([Validators.required, Validators.email]);
      this.form.get('ciudad')!.setValidators(Validators.required);
      this.form.get('direccion')!.setValidators(Validators.required);
      camposNuevoCliente.forEach((campo) => {
        this.form.get(campo)!.updateValueAndValidity({ emitEvent: false });
      });
    }
  });

  /** Efecto que reacciona a la respuesta del servicio de clientes */
  private readonly clienteDataEffect = effect(() => {
    const data = this.clienteService.cliente();
    const cita = this.datosCita();

    if (!this.clienteService.documento()) return;

    if (data && data.length > 0) {
      const cliente = Array.isArray(data) ? data[0] : data;
      this.nombreMostrar = `Hola ${cliente.nombres} ${cliente.apellidos}`;
      this.clienteExistente.set(true);
      this.form.patchValue({
        nombres: cliente.nombres || '',
        apellidos: cliente.apellidos || '',
        telefono: cliente.telefono || '',
        whatsapp: cliente.whatsapp || cliente.telefono || '',
        correo: cliente.correo || '',
        fecha_nacimiento: cliente.fecha_nacimiento ? new Date(cliente.fecha_nacimiento) : null,
        valor_abono: cita?.valor_abono,
      });
    } else {
      this.nombreMostrar = '';
      this.clienteExistente.set(false);
      this.form.reset({
        documento: this.clienteService.documento(),
      });
    }
  });

  validarDocumento() {
    this.nombreMostrar = '';
    this.clienteExistente.set(null);
    const documento = this.form.get('documento')?.value;

    if (!documento || documento.length < 8) {
      return;
    }

    this.clienteService.actualizarDocumento(documento);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const cita = this.datosCita();
    if (!cita) return;

    const v = this.form.value;
    const datosPago = {
      tipo_servicio: cita.servicio.tipo_servicio_id,
      servicio: cita.servicio.id,
      sede: cita.sede,
      fecha: cita.fecha,
      hora: cita.hora,
      documento: v.documento,
      nombres: v.nombres,
      apellidos: v.apellidos,
      telefono: v.telefono || undefined,
      whatsapp: v.whatsapp || v.telefono || undefined,
      correo: v.correo || undefined,
      fecha_nacimiento: v.fecha_nacimiento
        ? new Date(v.fecha_nacimiento).toISOString().split('T')[0]
        : undefined,
      ciudad: v.ciudad || undefined,
      direccion: v.direccion || undefined,
      valor_abono: cita.valor_abono,
    };

    this.agendaService.generatePaymentLink(datosPago).subscribe({
      next: (response) => {
        if (response.success) {
          const boldUrl = response.data.url;
          const link = this.agendaService.currentPaymentLink();

          // Abrir Bold en nueva pestaña
          window.open(boldUrl, '_blank');

          // Angular navega a validar-pago con el link para hacer polling
          this.router.navigate(['/validar-pago'], {
            queryParams: { 'bold-order-id': link ?? response.data.transaction_id },
          });
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Error al generar el link de pago',
        });
      },
    });
  }

  get mostrarCamposNuevoCliente(): boolean {
    return this.clienteExistente() === false;
  }

  get mostrarFormulario(): boolean {
    return this.clienteExistente() !== null;
  }
}
