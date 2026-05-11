import { describe, it, expect } from 'vitest';
import { calculateIncomeTax } from '../src/income-tax.js';
import { rates2025 } from './fixtures/rates.js';

describe('calculateIncomeTax', () => {
  it('single, €50,000, standard credits, Class A PRSI', () => {
    const result = calculateIncomeTax(
      {
        grossIncomeCents: 5_000_000,
        filingStatus: 'single',
        creditKeys: ['personal_single', 'paye'],
        prsiClass: 'A',
      },
      rates2025,
    );

    expect(result.grossIncomeTaxCents).toBe(1_120_000); // 20%×44k + 40%×6k
    expect(result.totalCreditsCents).toBe(375_000);     // 1,875 + 1,875
    expect(result.incomeTaxCents).toBe(745_000);        // 11,200 - 3,750
    expect(result.uscCents).toBe(106_222);              // 6,006 + 27,496 + 72,720
    expect(result.prsiCents).toBe(205_000);             // 4.1% × 50,000
    expect(result.totalDeductionsCents).toBe(1_056_222);
    expect(result.netIncomeCents).toBe(3_943_778);
  });

  it('single, €12,000 — USC exempt, PRSI exempt, credits exceed income tax', () => {
    const result = calculateIncomeTax(
      {
        grossIncomeCents: 1_200_000,
        filingStatus: 'single',
        creditKeys: ['personal_single', 'paye'],
        prsiClass: 'A',
      },
      rates2025,
    );

    expect(result.incomeTaxCents).toBe(0);   // credits (375k) exceed gross tax (240k)
    expect(result.uscCents).toBe(0);          // income ≤ €13,000
    expect(result.prsiCents).toBe(0);         // weekly income ≤ €352
    expect(result.netIncomeCents).toBe(1_200_000);
  });

  it('married one income, €60,000, Class A PRSI', () => {
    const result = calculateIncomeTax(
      {
        grossIncomeCents: 6_000_000,
        filingStatus: 'married_one_income',
        creditKeys: ['personal_married', 'paye'],
        prsiClass: 'A',
      },
      rates2025,
    );

    expect(result.grossIncomeTaxCents).toBe(1_340_000); // 20%×53k + 40%×7k
    expect(result.totalCreditsCents).toBe(562_500);     // 3,750 + 1,875
    expect(result.incomeTaxCents).toBe(777_500);
    expect(result.uscCents).toBe(136_222);              // 6,006 + 27,496 + 102,720
    expect(result.prsiCents).toBe(246_000);             // 4.1% × 60,000
    expect(result.totalDeductionsCents).toBe(1_159_722);
  });

  it('single, €13,001 — just above USC exemption', () => {
    const result = calculateIncomeTax(
      {
        grossIncomeCents: 1_300_100,
        filingStatus: 'single',
        creditKeys: ['personal_single', 'paye'],
        prsiClass: 'A',
      },
      rates2025,
    );

    expect(result.uscCents).toBeGreaterThan(0);
  });

  it('Class S PRSI — self-employed €30,000, minimum charge does not apply', () => {
    const result = calculateIncomeTax(
      {
        grossIncomeCents: 3_000_000,
        filingStatus: 'single',
        creditKeys: ['personal_single', 'earned_income'],
        prsiClass: 'S',
      },
      rates2025,
    );

    // 4.1% × 30,000 = 1,230 EUR = 123,000 cents > minimum 500 cents
    expect(result.prsiCents).toBe(123_000);
  });

  it('Class S PRSI — income ≤ €5,000 is exempt', () => {
    const result = calculateIncomeTax(
      {
        grossIncomeCents: 400_000,
        filingStatus: 'single',
        creditKeys: ['personal_single'],
        prsiClass: 'S',
      },
      rates2025,
    );

    expect(result.prsiCents).toBe(0);
  });

  it('Class D PRSI rate is 0.9%', () => {
    const result = calculateIncomeTax(
      {
        grossIncomeCents: 5_000_000,
        filingStatus: 'single',
        creditKeys: ['personal_single', 'paye'],
        prsiClass: 'D',
      },
      rates2025,
    );

    expect(result.prsiCents).toBe(45_000); // 0.9% × 50,000 = 450 EUR
  });

  it('high earner uses 8% USC top band', () => {
    // €100,000 income
    const result = calculateIncomeTax(
      {
        grossIncomeCents: 10_000_000,
        filingStatus: 'single',
        creditKeys: ['personal_single', 'paye'],
        prsiClass: 'A',
      },
      rates2025,
    );

    // USC: 6,006 + 27,496 + 133,152 (3% × 44,284 EUR) + 237,568 (8% × 29,956)
    // Band3: 4,428,400 × 0.03 = 132,852
    // Band4: (10,000,000 - 1,201,200 - 1,374,800 - 4,428,400) × 0.08 = 2,995,600 × 0.08 = 239,648
    // Total: 6,006 + 27,496 + 132,852 + 239,648 = 406,002
    expect(result.uscCents).toBe(406_002);
  });
});
