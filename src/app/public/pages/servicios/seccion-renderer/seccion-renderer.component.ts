import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet, UpperCasePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { SeccionWeb, ServicioDetalle } from '../../../../models/servicio-detalle.model';
import { Sedes } from '../../../../models/sedes.model';
import { environment } from '../../../../environments/env.dev';

@Component({
  selector: 'app-seccion-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MatExpansionModule, MatIconModule, RouterModule, UpperCasePipe],
  templateUrl: './seccion-renderer.component.html',
  styleUrl: './seccion-renderer.component.scss',
  host: {
    '(document:keydown.escape)': 'closeLightbox()',
  },
})
export class SeccionRendererComponent {
  readonly seccion = input.required<SeccionWeb>();
  readonly servicio = input<ServicioDetalle | null>(null);
  readonly sede = input<Sedes | null>(null);

  readonly lightboxUrl = signal<string | null>(null);

  private sanitizer = inject(DomSanitizer);

  openLightbox(url: string): void {
    this.lightboxUrl.set(url);
  }

  closeLightbox(): void {
    this.lightboxUrl.set(null);
  }

  safeHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  safeVideoUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO').format(price);
  }

  getImagenUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.baseUrl}${path.startsWith('/') ? path.slice(1) : path}`;
  }
}
