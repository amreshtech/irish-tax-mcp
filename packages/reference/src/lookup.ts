import data2025 from '../data/2025.json';
import type { TaxRates } from '@irish-tax-mcp/core';

const SUPPORTED_YEARS = [2025] as const;
type SupportedYear = (typeof SUPPORTED_YEARS)[number];

function isSupportedYear(year: number): year is SupportedYear {
  return (SUPPORTED_YEARS as readonly number[]).includes(year);
}

export function getRates(year: number): TaxRates {
  if (!isSupportedYear(year)) {
    throw new Error(
      `Tax year ${year} is not supported. Supported years: ${SUPPORTED_YEARS.join(', ')}`,
    );
  }
  return data2025 as unknown as TaxRates;
}

export type ReferenceTopics =
  | 'income_tax'
  | 'usc'
  | 'prsi'
  | 'tax_credits'
  | 'cgt'
  | 'vat'
  | 'stamp_duty';

export function getTopicReference(topic: ReferenceTopics, year: number): unknown {
  const rates = getRates(year);

  switch (topic) {
    case 'income_tax':
      return {
        year: rates.year,
        rates: rates.incomeTax.rates,
        cutOffPointsCents: rates.incomeTax.cutOffPointsCents,
        cutOffPointsEur: Object.fromEntries(
          Object.entries(rates.incomeTax.cutOffPointsCents).map(([k, v]) => [k, v / 100]),
        ),
      };
    case 'usc':
      return {
        year: rates.year,
        exemptionThresholdEur: rates.usc.exemptionThresholdCents / 100,
        bands: rates.usc.bands.map((b) => ({
          widthEur: b.widthCents !== null ? b.widthCents / 100 : null,
          rate: b.rate,
          ratePercent: `${b.rate * 100}%`,
        })),
      };
    case 'prsi':
      return {
        year: rates.year,
        classA: {
          weeklyExemptionEur: rates.prsi.classA.weeklyExemptionCents / 100,
          rate: rates.prsi.classA.rate,
          ratePercent: `${rates.prsi.classA.rate * 100}%`,
        },
        classS: {
          incomeThresholdEur: rates.prsi.classS.incomeThresholdCents / 100,
          minimumAnnualEur: rates.prsi.classS.minimumAnnualCents / 100,
          rate: rates.prsi.classS.rate,
          ratePercent: `${rates.prsi.classS.rate * 100}%`,
        },
        classD: {
          rate: rates.prsi.classD.rate,
          ratePercent: `${rates.prsi.classD.rate * 100}%`,
        },
      };
    case 'tax_credits':
      return {
        year: rates.year,
        creditsEur: Object.fromEntries(
          Object.entries(rates.taxCreditsCents).map(([k, v]) => [k, v / 100]),
        ),
        creditsCents: rates.taxCreditsCents,
      };
    case 'cgt':
      return {
        year: rates.year,
        rate: rates.cgt.rate,
        ratePercent: `${rates.cgt.rate * 100}%`,
        annualExemptionEur: rates.cgt.annualExemptionCents / 100,
        annualExemptionCents: rates.cgt.annualExemptionCents,
      };
    case 'vat':
      return {
        year: rates.year,
        rates: rates.vat.rates,
        descriptions: rates.vat.descriptions,
      };
    case 'stamp_duty':
      return {
        year: rates.year,
        _note: 'Stamp duty data is informational. Verify with Revenue for complex transactions.',
      };
  }
}
