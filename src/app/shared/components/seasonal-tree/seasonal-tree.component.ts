import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type Season = 'primavera' | 'verano' | 'otono' | 'invierno';

@Component({
  selector: 'app-seasonal-tree',
  templateUrl: './seasonal-tree.component.html',
  styleUrl: './seasonal-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonalTreeComponent {
  private readonly today = signal(new Date());

  protected readonly season = computed<Season>(() => {
    const date = this.today();
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // Hemisferio Norte
    if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day <= 20)) {
      return 'primavera';
    }
    if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 22)) {
      return 'verano';
    }
    if ((month === 9 && day >= 23) || month === 10 || month === 11 || (month === 12 && day <= 20)) {
      return 'otono';
    }
    return 'invierno';
  });
}
