/**
 * Seeded random number generator for reproducible synthetic data
 */

export class SeededRandom {
  private seed: number;

  constructor(seed: number = 42) {
    this.seed = seed;
  }

  // Linear congruential generator
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  // Random integer between min (inclusive) and max (inclusive)
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Random float between min and max
  float(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  // Pick random item from array
  pick<T>(array: readonly T[]): T {
    const item = array[Math.floor(this.next() * array.length)];
    if (item === undefined) {
      throw new Error('Cannot pick from empty array');
    }
    return item;
  }

  // Pick multiple unique items from array
  pickMultiple<T>(array: readonly T[], count: number): T[] {
    const shuffled = [...array].sort(() => this.next() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  // Weighted random selection
  weighted<T>(items: readonly T[], weights: readonly number[]): T {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = this.next() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      const weight = weights[i];
      if (weight === undefined) continue;
      random -= weight;
      if (random <= 0) {
        const item = items[i];
        if (item === undefined) {
          throw new Error('Invalid item index');
        }
        return item;
      }
    }

    const lastItem = items[items.length - 1];
    if (lastItem === undefined) {
      throw new Error('Cannot pick from empty items');
    }
    return lastItem;
  }

  // Boolean with probability
  boolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  // Generate random date between two dates
  date(start: Date, end: Date): Date {
    const startTime = start.getTime();
    const endTime = end.getTime();
    return new Date(startTime + this.next() * (endTime - startTime));
  }

  // Reset to initial seed
  reset(seed?: number): void {
    this.seed = seed ?? 42;
  }
}

// Global seeded random instance
export const random = new SeededRandom(42);

// Utility to format date as ISO string (date only)
export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

// Calculate days between two dates
export function daysBetween(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Add days to a date
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Subtract days from a date
export function subtractDays(date: Date | string, days: number): Date {
  return addDays(date, -days);
}
