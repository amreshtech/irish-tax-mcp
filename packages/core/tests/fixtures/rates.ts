import type { TaxRates } from '../../src/types.js';

export const rates2025: TaxRates = {
  year: 2025,
  incomeTax: {
    rates: { standard: 0.20, higher: 0.40 },
    cutOffPointsCents: {
      single: 4_400_000,
      married_one_income: 5_300_000,
      married_two_incomes: 8_800_000,
      widowed: 4_400_000,
    },
  },
  usc: {
    exemptionThresholdCents: 1_300_000,
    bands: [
      { widthCents: 1_201_200, rate: 0.005 },
      { widthCents: 1_374_800, rate: 0.02 },
      { widthCents: 4_428_400, rate: 0.03 },
      { widthCents: null, rate: 0.08 },
    ],
  },
  prsi: {
    classA: { weeklyExemptionCents: 35_200, rate: 0.041 },
    classS: { incomeThresholdCents: 500_000, minimumAnnualCents: 50_000, rate: 0.041 },
    classD: { rate: 0.009 },
  },
  taxCreditsCents: {
    personal_single: 187_500,
    personal_married: 375_000,
    paye: 187_500,
    earned_income: 187_500,
    home_carer: 180_000,
    single_person_child_carer: 175_000,
  },
  cgt: { rate: 0.33, annualExemptionCents: 127_000 },
  vat: {
    rates: { A: 0.23, B: 0.135, C: 0.09, D: 0.0 },
    descriptions: {
      A: 'Standard rate',
      B: 'Reduced rate',
      C: 'Second reduced rate',
      D: 'Zero rate',
    },
  },
  stampDuty: {
    residential: [
      { widthCents: 100_000_000, rate: 0.01 },
      { widthCents: null, rate: 0.02 },
    ],
    nonResidential: 0.075,
    shares: 0.01,
  },
  cat: {
    rate: 0.33,
    thresholdsCents: {
      A: 400_000_00,
      B: 40_000_00,
      C: 20_000_00,
    },
    smallGiftExemptionCents: 3_000_00,
  },
};
