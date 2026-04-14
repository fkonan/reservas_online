import { ServiciosService } from '../../../shared/services/servicios.service';
import {
  Component,
  ElementRef,
  inject,
  Signal,
  signal,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { Sedes } from '../../../models/sedes.model';
import { CategoriaServicio } from '../../../models/servicios.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { Agenda } from '../../../models/agenda.model';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ClienteDialogComponent } from '../../../shared/components/cliente-dialog/cliente-dialog.component';
import { AgendaService } from '../../../shared/services/agenda.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientesService } from '../../../shared/services/clientes.service';
import Swal from 'sweetalert2';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/env.dev';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { IconRendererPipe } from '../../../shared/pipes/icon-renderer.pipe';
import { HeaderPromoComponent } from '../../../shared/components/header-promo/header-promo.component';
import { SeasonalTreeBottomComponent } from '../../../shared/components/seasonal-tree-bottom/seasonal-tree-bottom.component';

@Component({
  selector: 'app-servicios',
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    HeaderPromoComponent,
    SeasonalTreeBottomComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss',
})
export class ServiciosComponent {
  private readonly location = inject(Location);
  categoria = signal<CategoriaServicio | null>(null);
  sede: Sedes;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state: Record<string, unknown> =
      navigation?.extras.state ??
      (this.location.getState() as Record<string, unknown>);
    this.sede = (state?.['sede'] as Sedes) || null;
    this.categoria.set((state?.['categoria'] as CategoriaServicio) || null);
  }

  getImagenUrl(foto: string | null | undefined): string {
    return foto ? `${foto}` : 'assets/imagen-default.jpg';
  }

  onServicioClick(servicio: any): void {
    this.router.navigate(['/servicios', servicio.id], {
      state: {
        categoria: this.categoria(),
        sede: this.sede,
      },
    });
  }
}
