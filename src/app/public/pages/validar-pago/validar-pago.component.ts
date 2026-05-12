import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ValidarPagoService } from '../../../shared/services/validar-pago.service';
import { AvisoFinal } from '../../../models/servicio-detalle.model';
import { environment } from '../../../environments/env.dev';
import { SeasonalTreeBottomComponent } from '../../../shared/components/seasonal-tree-bottom/seasonal-tree-bottom.component';
import { HeaderPromoComponent } from '../../../shared/components/header-promo/header-promo.component';

const MAX_POLLS = 24; // 24 × 5s = 2 minutos
const POLL_INTERVAL_MS = 5000;

const ESTADOS_FINALES = new Set(['PAID', 'REJECTED', 'CANCELLED', 'EXPIRED']);

@Component({
  selector: 'app-validar-pago',
  imports: [HeaderPromoComponent, SeasonalTreeBottomComponent],
  templateUrl: './validar-pago.component.html',
  styleUrl: './validar-pago.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:beforeunload)': 'onBeforeUnload()',
  },
})
export class ValidarPagoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private validarPagoService = inject(ValidarPagoService);
  private destroyRef = inject(DestroyRef);

  readonly mensaje = signal('Validando tu pago...');
  readonly data = signal<any>(null);
  readonly status = signal<string>('');
  readonly isValidating = signal(true);
  readonly pollingTerminado = signal(false);
  readonly avisoFinal = signal<AvisoFinal | null>(null);
  readonly mensajeError = signal('');
  readonly servicioReservado = signal<string>('');

  private currentLink: string | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private pollCount = 0;

  ngOnInit(): void {
    const avisoRaw = localStorage.getItem('aviso_final');
    if (avisoRaw) {
      try {
        this.avisoFinal.set(JSON.parse(avisoRaw));
      } catch {
        this.avisoFinal.set(null);
      }
    }

    this.servicioReservado.set(localStorage.getItem('servicio_reservado') ?? '');

    this.route.queryParamMap.subscribe((params) => {
      const link = params.get('bold-order-id');
      if (link) {
        this.currentLink = link;
        this.iniciarPolling(link);
      } else {
        this.isValidating.set(false);
        this.pollingTerminado.set(true);
        this.status.set('ERROR');
        this.mensaje.set('No se encontró el identificador de la transacción.');
      }
    });

    this.destroyRef.onDestroy(() => this.limpiarInterval());
  }

  private iniciarPolling(link: string): void {
    this.pollCount = 0;
    this.consultarEstado(link);

    this.intervalId = setInterval(() => {
      this.pollCount++;
      if (this.pollCount >= MAX_POLLS) {
        this.limpiarInterval();
        this.handleTimeout();
        return;
      }
      this.consultarEstado(link);
    }, POLL_INTERVAL_MS);
  }

  private consultarEstado(link: string): void {
    this.validarPagoService.validarPago(link).subscribe({
      next: (response: any) => {
        const st: string = response.data?.status ?? '';
        if (ESTADOS_FINALES.has(st)) {
          this.limpiarInterval();
          this.pollingTerminado.set(true);
          this.isValidating.set(false);
          this.data.set(response.data);
          this.mensaje.set(response.message ?? '');
          this.status.set(st);
        }
        // Si es ACTIVE o PROCESSING seguimos esperando
      },
      error: (err: HttpErrorResponse) => {
        const isPermanent =
          (err.status >= 400 && err.status < 500 && err.status !== 408 && err.status !== 429);
        if (isPermanent) {
          this.limpiarInterval();
          this.pollingTerminado.set(true);
          this.isValidating.set(false);
          this.status.set('ERROR');
          this.mensaje.set('No fue posible verificar tu pago. Por favor contáctanos.');
        }
        // status 0, 5xx, 408, 429 → error transitorio, continuar polling
      },
    });
  }

  private handleTimeout(): void {
    this.pollingTerminado.set(true);
    this.isValidating.set(false);
    this.status.set('TIMEOUT');
    this.mensaje.set('El tiempo de espera agotó. Por favor verifica tu correo o contáctanos.');
  }

  private limpiarInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onBeforeUnload(): void {
    if (!this.pollingTerminado() && this.currentLink) {
      const url = `${environment.baseUrl}api/payment/abandon/${this.currentLink}?token=${environment.APP_TOKEN}`;
      navigator.sendBeacon(url);
    }
  }

  /** Mensaje descriptivo según el tipo de estado fallido */
  getMensajeEstado(st: string): string {
    switch (st) {
      case 'REJECTED':
        return 'El pago fue rechazado por la pasarela. Puedes intentarlo de nuevo.';
      case 'CANCELLED':
        return 'Cancelaste el proceso de pago. Puedes volver e intentarlo nuevamente.';
      case 'EXPIRED':
        return 'El link de pago venció. Por favor genera una nueva reserva.';
      case 'TIMEOUT':
        return this.mensaje();
      case 'ERROR':
        return this.mensaje();
      default:
        return 'Ocurrió un problema con tu pago. Por favor contáctanos.';
    }
  }
}

