import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'confidence',
  standalone: true
})
export class ConfidencePipe implements PipeTransform {
  transform(value: number | null | undefined, format: 'percent' | 'badge' = 'percent'): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    // Handles both 0.94 and 94
    const normalized = value <= 1 && value > 0 ? Math.round(value * 100) : Math.round(value);

    if (format === 'badge') {
      if (normalized >= 90) return `High Confidence (${normalized}%)`;
      if (normalized >= 70) return `Moderate (${normalized}%)`;
      return `Low Confidence (${normalized}%)`;
    }

    return `${normalized}%`;
  }
}
