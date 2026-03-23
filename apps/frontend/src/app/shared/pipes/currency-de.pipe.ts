import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyDe', standalone: true })
export class CurrencyDePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '0,00 €';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }
}
