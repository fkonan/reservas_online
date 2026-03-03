import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'iconRenderer'
})
export class IconRendererPipe implements PipeTransform {
  private readonly domSanitizer = inject(DomSanitizer);

  transform(iconString: string): SafeHtml {
    if (!iconString) return '';

    const icons = iconString.split('|');
    const htmlParts = icons.map(icon => {
      const [type, name] = icon.split(':');

      if (type === 'material') {
        return `<span class="material-symbols-outlined">${name}</span>`;
      } else if (type === 'custom') {
        return `<img class="custom-icon" src="/icons/${name}.svg" alt="${name}" />`;
      }
      return '';
    });

    return this.domSanitizer.bypassSecurityTrustHtml(htmlParts.join(''));
  }
}
