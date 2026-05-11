import { describe, it, expect } from 'vitest';
import { calculateCat } from '../src/cat.js';
import { rates2025 } from './fixtures/rates.js';

describe('calculateCat', () => {
  it('uses available threshold before charging CAT', () => {
    const result = calculateCat(
      { benefitCents: 10_000_000, group: 'A', priorTaxableBenefitsCents: 35_000_000 },
      rates2025,
    );

    expect(result.thresholdCents).toBe(40_000_000);
    expect(result.thresholdConsumedCents).toBe(5_000_000);
    expect(result.remainingThresholdCents).toBe(0);
    expect(result.taxableAmountCents).toBe(5_000_000);
    expect(result.catDueCents).toBe(1_650_000);
  });

  it('applies the small gift exemption when requested', () => {
    const result = calculateCat(
      { benefitCents: 500_000, group: 'C', applySmallGiftExemption: true },
      rates2025,
    );

    expect(result.smallGiftExemptionAppliedCents).toBe(300_000);
    expect(result.taxableBenefitAfterExemptionCents).toBe(200_000);
    expect(result.taxableAmountCents).toBe(0);
    expect(result.catDueCents).toBe(0);
  });

  it('charges CAT when prior benefits already exhausted the threshold', () => {
    const result = calculateCat(
      { benefitCents: 2_000_000, group: 'B', priorTaxableBenefitsCents: 4_000_000 },
      rates2025,
    );

    expect(result.thresholdConsumedCents).toBe(0);
    expect(result.remainingThresholdCents).toBe(0);
    expect(result.taxableAmountCents).toBe(2_000_000);
    expect(result.catDueCents).toBe(660_000);
  });

  it('handles benefits fully sheltered by remaining threshold', () => {
    const result = calculateCat(
      { benefitCents: 1_500_000, group: 'C', priorTaxableBenefitsCents: 500_000 },
      rates2025,
    );

    expect(result.thresholdConsumedCents).toBe(1_500_000);
    expect(result.remainingThresholdCents).toBe(0);
    expect(result.taxableAmountCents).toBe(0);
    expect(result.catDueCents).toBe(0);
  });
});
