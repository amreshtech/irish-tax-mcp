import {
  calculateAnnualPersonalTax,
  calculateCat,
  calculateIncomeTax,
  calculateStampDuty,
} from '../packages/core/src/index.js';
import { getRates } from '../packages/reference/src/lookup.js';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const rates = getRates(2025);

const incomeTaxSample = calculateIncomeTax(
  {
    grossIncomeCents: 5_000_000,
    filingStatus: 'single',
    creditKeys: ['personal_single', 'paye'],
    prsiClass: 'A',
  },
  rates,
);

assert(incomeTaxSample.grossIncomeTaxCents === 1_120_000, 'Unexpected gross income tax for €50,000 single PAYE sample');
assert(incomeTaxSample.incomeTaxCents === 745_000, 'Unexpected net income tax for €50,000 single PAYE sample');
assert(incomeTaxSample.prsiCents === 205_000, 'Unexpected PRSI for €50,000 single PAYE sample');
assert(incomeTaxSample.uscCents === 106_222, 'Unexpected USC for €50,000 single PAYE sample');
assert(incomeTaxSample.netIncomeCents === 3_943_778, 'Unexpected net income for €50,000 single PAYE sample');

const stampDutySample = calculateStampDuty(
  { considerationCents: 150_000_000, propertyType: 'residential' },
  rates,
);
assert(stampDutySample.dutyDueCents === 2_000_000, 'Unexpected stamp duty for €1.5m residential sample');

const catSample = calculateCat(
  { benefitCents: 10_000_000, group: 'A', priorTaxableBenefitsCents: 35_000_000 },
  rates,
);
assert(catSample.taxableAmountCents === 5_000_000, 'Unexpected CAT taxable amount for Group A sample');
assert(catSample.catDueCents === 1_650_000, 'Unexpected CAT due for Group A sample');

const annualPersonalTaxSample = calculateAnnualPersonalTax(
  {
    filingStatus: 'single',
    creditKeys: ['personal_single', 'paye', 'earned_income'],
    incomeSources: [
      { kind: 'employment', grossIncomeCents: 5_000_000 },
      { kind: 'self_employment', grossIncomeCents: 2_000_000 },
    ],
  },
  rates,
);
assert(annualPersonalTaxSample.totalGrossIncomeCents === 7_000_000, 'Unexpected annual personal-tax gross income');
assert(annualPersonalTaxSample.prsiByClassCents.A === 205_000, 'Unexpected annual personal-tax Class A PRSI');
assert(annualPersonalTaxSample.prsiByClassCents.S === 82_000, 'Unexpected annual personal-tax Class S PRSI');
assert(annualPersonalTaxSample.totalDeductionsCents === 1_810_722, 'Unexpected annual personal-tax deductions');

console.log(JSON.stringify({ status: 'ok', year: 2025, checks: 12 }, null, 2));
