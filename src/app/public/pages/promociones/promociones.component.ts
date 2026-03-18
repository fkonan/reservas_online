import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { PromocionesService } from '../../../shared/services/promociones.service';
import { HeaderPromoComponent } from '../../../shared/components/header-promo/header-promo.component';
import { Promocion } from '../../../models/promociones.model';
import { CurrencyPipe } from '@angular/common';
import { SeasonalTreeComponent } from '../../../shared/components/seasonal-tree/seasonal-tree.component';
import { SeasonalTreeBottomComponent } from '../../../shared/components/seasonal-tree-bottom/seasonal-tree-bottom.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-promociones',
  imports: [RouterModule, HeaderPromoComponent, CurrencyPipe,SeasonalTreeBottomComponent, CommonModule],
  templateUrl: './promociones.component.html',
  styleUrl: './promociones.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromocionesComponent {
  private readonly promoService = inject(PromocionesService);

  protected readonly promociones = this.promoService.promociones;
  protected readonly isLoading = this.promoService.isLoading;

  protected readonly tipoSeleccionado = signal<string>('todos');

  protected readonly tiposDisponibles = computed(() => {
    const tipos = new Set(this.promociones().map((p) => p.tipo_promocion));
    return Array.from(tipos);
  });

  protected readonly promocionesFiltradas = computed<Promocion[]>(() => {
    const tipo = this.tipoSeleccionado();
    console.log(this.promociones());
    if (tipo === 'todos') return this.promociones();
     const filtradas = this.promociones().filter(
    (p) => p.tipo_promocion === tipo
  );
  console.log(filtradas);
  return filtradas;
  });

  protected readonly expandidos = signal<Set<number>>(new Set());

  toggleDetalle(id: number): void {
    this.expandidos.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isExpandido(id: number): boolean {
    return this.expandidos().has(id);
  }

  labelTipo(tipo: string): string {
    const map: Record<string, string> = {
      descuento: 'Descuentos',
      precio_especial: 'Precio especial',
      combo: 'Combos',
    };
    return map[tipo] ?? tipo;
  }
}
