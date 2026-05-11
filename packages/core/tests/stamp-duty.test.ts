import { describe, it, expect } from 'vitest';
import { calculateStampDuty } from '../src/stamp-duty.js';
import { rates2025 } from './fixtures/rates.js';

describe('calculateStampDuty', () => {
  it('residential property under €1m is charged at 1%', () => {
    const result = calculateStampDuty(
      { considerationCents: 75_000_000, propertyType: 'residential' },
      rates2025,
    );

    expect(result.dutyDueCents).toBe(750_000);
    expect(result.effectiveRate).toBe(0.01);
  });

  it('residential property above €1m uses the higher band on the excess', () => {
    const result = calculateStampDuty(
      { considerationCents: 150_000_000, propertyType: 'residential' },
      rates2025,
    );

    expect(result.dutyDueCents).toBe(2_000_000);
    expect(result.effectiveRate).toBeCloseTo(2_000_000 / 150_000_000, 10);
  });

  it('non-residential property uses 7.5%', () => {
    const result = calculateStampDuty(
      { considerationCents: 40_000_000, propertyType: 'non_residential' },
      rates2025,
    );

    expect(result.dutyDueCents).toBe(3_000_000);
    expect(result.effectiveRate).toBe(0.075);
  });

  it('shares use 1%', () => {
    const result = calculateStampDuty(
      { considerationCents: 2_500_000, propertyType: 'shares' },
      rates2025,
    );

    expect(result.dutyDueCents).toBe(25_000);
    expect(result.effectiveRate).toBe(0.01);
  });

  it('zero consideration returns zero duty', () => {
    const result = calculateStampDuty(
      { considerationCents: 0, propertyType: 'residential' },
      rates2025,
    );

    expect(result.dutyDueCents).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });
});
