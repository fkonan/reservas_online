import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { toSignal, rxResource } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UpperCasePipe, Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ServicioWebService } from '../../../../shared/services/servicio-web.service';
import { SeccionRendererComponent } from '../seccion-renderer/seccion-renderer.component';
import { HeaderPromoComponent } from '../../../../shared/components/header-promo/header-promo.component';
import { CategoriaServicio } from '../../../../models/servicios.model';
import { Sedes } from '../../../../models/sedes.model';
import { environment } from '../../../../environments/env.dev';
import { SeasonalTreeBottomComponent } from '../../../../shared/components/seasonal-tree-bottom/seasonal-tree-bottom.component';

@Component({
  selector: 'app-servicio-detalle',
  templateUrl: './servicio-detalle.component.html',
  styleUrl: './servicio-detalle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatTooltipModule,
    SeccionRendererComponent,
    HeaderPromoComponent,
    UpperCasePipe,
    SeasonalTreeBottomComponent
  ],
})
export class ServicioDetalleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly titleService = inject(Title);
  private readonly servicioWebService = inject(ServicioWebService);

  private readonly routeParams = toSignal(this.route.params);

  /** Extrae el ID numérico del parámetro de ruta, soportando "5" y "5-sistema-liso-hd-oled" */
  readonly servicioId = computed(() => {
    const param = String(this.routeParams()?.['id'] ?? '');
    return Number(param.split('-')[0]);
  });

  readonly servicioResource = rxResource({
    params: () => ({ id: this.servicioId() }),
    stream: ({ params }) => this.servicioWebService.getServicio(params.id),
  });

  readonly error = computed(() => this.servicioResource.error());
  readonly loading = computed(() => this.servicioResource.isLoading() && !this.servicioResource.error());
  readonly servicio = computed(() => {
    if (this.servicioResource.error()) return undefined;
    return this.servicioResource.value();
  });
  readonly errorMessage = computed(() => {
    const err = this.error();
    if (!err) return 'No se pudo cargar la información del servicio.';
    if (err instanceof Error) return err.message;
    const e = err as any;
    return e?.error?.message ?? e?.message ?? 'No se pudo cargar la información del servicio.';
  });

  constructor() {
    // Una vez que carga el servicio, actualiza la URL con el slug y el título de la página
    effect(() => {
      const s = this.servicio();
      if (s?.web?.slug) {
        const slugUrl = `/servicios/${s.id}-${s.web.slug}`;
        this.location.replaceState(slugUrl, '', { categoria: this.categoria(), sede: this.sede() });
        this.titleService.setTitle(s.web.titulo_publico);
        // console.log(s);
      }
    });
  }

  // Datos pasados por estado de navegación (opcionales al refrescar)
  // Fallback a location.getState() para cuando se refresca la página (getCurrentNavigation() = null)
  private readonly navState =
    this.router.getCurrentNavigation()?.extras.state ??
    (this.location.getState() as Record<string, unknown>);
  readonly categoria = signal<CategoriaServicio | null>(this.navState?.['categoria'] ?? null);
  readonly sede = signal<Sedes | null>(this.navState?.['sede'] ?? null);
  readonly activeAtributoId = signal<number | null>(null);

  readonly serviciosEnCategoria = computed(
    () => this.categoria()?.servicios ?? []
  );

  getImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.baseUrl}${path.startsWith('/') ? path.slice(1) : path}`;
  }

  toggleAtributo(id: number): void {
    this.activeAtributoId.update(current => current === id ? null : id);
  }

  onServicioChange(servicioId: number): void {
    this.router.navigate(['/servicios', servicioId], {
      state: {
        categoria: this.categoria(),
        sede: this.sede(),
      },
    });
  }

  navegarHorario(): void {
    const s = this.servicio();
    if (!s) return;
    const valorAbono =
      this.serviciosEnCategoria().find((srv) => srv.id === s.id)
        ?.tipo_servicio_id?.valor_abono ?? 0;
    this.router.navigate(['/horario'], {
      state: { servicio: s, sede: this.sede(), valor_abono: valorAbono },
    });
  }

  goBack(): void {
    if (this.categoria()) {
      this.router.navigate(['/servicios'], {
        state: {
          categoria: this.categoria(),
          sede: this.sede(),
        },
      });
    } else {
      this.location.back();
    }
  }
}
