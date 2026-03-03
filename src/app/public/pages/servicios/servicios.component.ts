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
import { MatExpansionModule, MatExpansionPanelContent } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/env.dev';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { IconRendererPipe } from '../../../shared/pipes/icon-renderer.pipe';

@Component({
  selector: 'app-servicios',
  imports: [
    CommonModule,
    RouterModule,
    MatExpansionModule,
    MatIconModule,
    HeaderComponent,
    IconRendererPipe,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss',
})
export class ServiciosComponent {
  categoria = signal<CategoriaServicio | null>(null);
  sede: Sedes;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.sede = navigation?.extras.state?.['sede'] || null;
    this.categoria.set(navigation?.extras.state?.['categoria'] || null);
  }

  getImagenUrl(foto: string | null | undefined): string {
    return foto ? `${foto}` : 'assets/imagen-default.jpg';
  }
}
