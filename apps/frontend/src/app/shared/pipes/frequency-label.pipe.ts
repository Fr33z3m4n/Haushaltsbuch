import { Pipe, PipeTransform } from '@angular/core';
import { TransactionFrequency, FREQUENCY_LABELS } from '../../core/models/transaction.model';

@Pipe({ name: 'frequencyLabel', standalone: true })
export class FrequencyLabelPipe implements PipeTransform {
  transform(value: TransactionFrequency): string {
    return FREQUENCY_LABELS[value] ?? value;
  }
}
