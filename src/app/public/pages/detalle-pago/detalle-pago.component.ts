import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
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
  protected readonly buscandoCliente = computed(() => !!this.clienteService.documento() && this.clienteService.isLoading());
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

    // Búsqueda reactiva por documento
    const docControl = this.form.get('documento')!;

    // Reset inmediato cuando el valor es muy corto (sin debounce)
    docControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((val: string) => {
        if (!val || val.length < 5) {
          this.nombreMostrar = '';
          this.clienteExistente.set(null);
          this.clienteService.documento.set(null);
        }
      });

    // Búsqueda con debounce cuando hay suficientes dígitos
    docControl.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((val: string) => {
        if (val && val.length >= 5) {
          this.nombreMostrar = '';
          this.clienteExistente.set(null);
          this.clienteService.actualizarDocumento(val);
        }
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
    const noAgendar = this.clienteService.noAgendar();
    const errorServidor = this.clienteService.errorServidor();
    const cita = this.datosCita();

    if (!this.clienteService.documento()) return;

    // CASO 5: error de servidor — mostrar mensaje genérico sin mostrar formulario
    if (errorServidor) {
      this.nombreMostrar = '';
      this.clienteExistente.set(null);
      Swal.fire({
        icon: 'error',
        title: 'Error del servidor',
        text: 'Ocurrió un error al consultar tus datos. Por favor intenta de nuevo.',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // CASO 2: cliente bloqueado — detener flujo completamente
    if (noAgendar) {
      this.nombreMostrar = '';
      this.clienteExistente.set(null);
      Swal.fire({
        icon: 'error',
        title: 'No es posible agendar',
        text: this.clienteService.mensajeBloqueo() || 'No es posible realizar una reserva en este momento, por favor comunícate con nosotros.',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    if (data && data.length > 0) {
      // CASO 1: cliente existente habilitado — precargar formulario
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
      // CASO 3: cliente nuevo — formulario vacío
      this.nombreMostrar = '';
      this.clienteExistente.set(false);
      this.form.reset({
        documento: this.clienteService.documento(),
      });
    }
  });

  private isInAppBrowser(): boolean {
    const ua = navigator.userAgent;
    return /FBAN|FBAV|Instagram|WhatsApp|Line\/|MicroMessenger/i.test(ua);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const cita = this.datosCita();
    if (!cita) return;

    if (this.isInAppBrowser()) {
      Swal.fire({
        icon: 'info',
        title: 'Abre en tu navegador',
        text: 'Para garantizar el proceso de pago, por favor abre este enlace directamente en Safari o Chrome.',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // Apertura síncrona de la pestaña: requisito de Safari/iOS para preservar el user gesture.
    const popup = window.open('about:blank', '_blank');
    if (popup && !popup.closed) {
      popup.document.open();
      popup.document.write(this.loadingHtml());
      popup.document.close();
    }

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
        if (!response.success) {
          if (popup && !popup.closed) popup.close();
          return;
        }

        const boldUrl = response.data.url;
        const link = this.agendaService.currentPaymentLink();
        const nombreServicio = cita.servicio.web?.titulo_publico || cita.servicio.nombre_comercial || '';
        localStorage.setItem('servicio_reservado', nombreServicio);

        const popupAbierto = popup && !popup.closed;

        if (popupAbierto) {
          popup!.location.href = boldUrl;
          popup!.focus();
          this.router.navigate(['/validar-pago'], {
            queryParams: { 'bold-order-id': link ?? response.data.transaction_id },
          });
        } else {
          window.location.href = boldUrl;
        }
      },
      error: (err) => {
        if (popup && !popup.closed) popup.close();
        const isNetworkError = !err.status || err.status === 0;
        Swal.fire({
          icon: 'error',
          title: 'Error al procesar el pago',
          text: isNetworkError
            ? 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo. Si el problema persiste, abre la aplicación directamente en Safari.'
            : (err.error?.message || 'Error al generar el link de pago'),
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

  private loadingHtml(): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preparando tu pago…</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
    background: linear-gradient(135deg, #f8faf3 0%, #e8f0d0 100%);
    color: #4a5c20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    overflow: hidden;
  }
  .card {
    max-width: 420px;
    width: 100%;
    text-align: center;
    background: #ffffff;
    border: 1px solid #dde8c0;
    border-radius: 20px;
    padding: 48px 32px;
    box-shadow: 0 20px 50px -20px rgba(102, 114, 57, 0.25), 0 4px 12px rgba(102, 114, 57, 0.08);
    animation: fadeIn .5s ease-out both;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .spinner {
    width: 72px;
    height: 72px;
    margin: 0 auto 28px;
    position: relative;
  }
  .spinner::before, .spinner::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 4px solid transparent;
  }
  .spinner::before {
    border-top-color: #667239;
    border-right-color: #8fa04a;
    animation: spin 1s linear infinite;
  }
  .spinner::after {
    inset: 10px;
    border-top-color: #b5c47e;
    border-left-color: #dde8c0;
    animation: spin 1.4s linear infinite reverse;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  h1 {
    font-size: 22px;
    font-weight: 600;
    margin: 0 0 12px;
    color: #4a5c20;
    letter-spacing: -0.01em;
  }
  p {
    font-size: 15px;
    line-height: 1.5;
    color: #667239;
    margin: 0 0 24px;
  }
  .dots {
    display: inline-flex;
    gap: 6px;
    justify-content: center;
  }
  .dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #8fa04a;
    animation: bounce 1.2s ease-in-out infinite;
  }
  .dots span:nth-child(2) { animation-delay: .15s; }
  .dots span:nth-child(3) { animation-delay: .3s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(.6); opacity: .4; }
    40%           { transform: scale(1);  opacity: 1; }
  }
  .footer {
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid #f0f4e8;
    font-size: 12px;
    color: #8fa04a;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <main class="card" role="status" aria-live="polite">
    <div class="spinner" aria-hidden="true"></div>
    <h1>Preparando tu pago</h1>
    <p>Estamos generando tu link seguro de pago. No cierres esta pestaña.</p>
    <div class="dots" aria-hidden="true"><span></span><span></span><span></span></div>
    <div class="footer">Conexión segura</div>
  </main>
</body>
</html>`;
  }
}
