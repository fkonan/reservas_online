import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-header-promo',
  imports: [MatToolbarModule],
  templateUrl: './header-promo.component.html',
  styleUrl: './header-promo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderPromoComponent {}
