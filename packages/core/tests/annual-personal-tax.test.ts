import { describe, it, expect } from 'vitest';
import { calculateAnnualPersonalTax } from '../src/annual-personal-tax.js';
import { rates2025 } from './fixtures/rates.js';

describe('calculateAnnualPersonalTax', () => {
  it('combines employment and self-employment income while calculating PRSI per source', () => {
    const result = calculateAnnualPersonalTax(
      {
        filingStatus: 'single',
        creditKeys: ['personal_single', 'paye', 'earned_income'],
        incomeSources: [
          { kind: 'employment', grossIncomeCents: 5_000_000 },
          { kind: 'self_employment', grossIncomeCents: 2_000_000 },
        ],
      },
      rates2025,
    );

    expect(result.totalGrossIncomeCents).toBe(7_000_000);
    expect(result.totalCreditsCents).toBe(562_500);
    expect(result.incomeTaxCents).toBe(1_357_500);
    expect(result.uscCents).toBe(166_222);
    expect(result.prsiByClassCents).toEqual({ A: 205_000, S: 82_000, D: 0 });
    expect(result.prsiCents).toBe(287_000);
    expect(result.totalDeductionsCents).toBe(1_810_722);
    expect(result.netIncomeCents).toBe(5_189_278);
  });

  it('returns source totals and zero values for an empty income list', () => {
    const result = calculateAnnualPersonalTax(
      {
        filingStatus: 'single',
        creditKeys: ['personal_single'],
        incomeSources: [],
      },
      rates2025,
    );

    expect(result.totalGrossIncomeCents).toBe(0);
    expect(result.sourceTotalsCents).toEqual({
      employment: 0,
      self_employment: 0,
      pension: 0,
      other: 0,
    });
    expect(result.incomeTaxCents).toBe(0);
    expect(result.uscCents).toBe(0);
    expect(result.prsiCents).toBe(0);
    expect(result.netIncomeCents).toBe(0);
  });
});
