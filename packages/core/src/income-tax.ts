import type {
  IncomeTaxParams,
  IncomeTaxResult,
  TaxBand,
  TaxRates,
  PrsiClass,
  PrsiRates,
  UscRates,
} from './types.js';

function applyBands(amountCents: number, bands: TaxBand[]): number {
  let taxCents = 0;
  let remaining = amountCents;

  for (const band of bands) {
    if (remaining <= 0) break;
    const inBand =
      band.widthCents === null
        ? remaining
        : Math.min(remaining, band.widthCents);
    taxCents += Math.round(inBand * band.rate);
    remaining -= inBand;
  }

  return taxCents;
}

function calculateUSC(grossIncomeCents: number, usc: UscRates): number {
  if (grossIncomeCents <= usc.exemptionThresholdCents) {
    return 0;
  }
  return applyBands(grossIncomeCents, usc.bands);
}

function calculatePRSI(
  grossIncomeCents: number,
  prsiClass: PrsiClass,
  prsi: PrsiRates,
): number {
  if (prsiClass === 'A') {
    const annualThresholdCents = prsi.classA.weeklyExemptionCents * 52;
    if (grossIncomeCents <= annualThresholdCents) return 0;
    return Math.round(grossIncomeCents * prsi.classA.rate);
  }

  if (prsiClass === 'S') {
    if (grossIncomeCents <= prsi.classS.incomeThresholdCents) return 0;
    const computed = Math.round(grossIncomeCents * prsi.classS.rate);
    return Math.max(prsi.classS.minimumAnnualCents, computed);
  }

  return Math.round(grossIncomeCents * prsi.classD.rate);
}

export function calculateIncomeTax(
  params: IncomeTaxParams,
  rates: TaxRates,
): IncomeTaxResult {
  const { grossIncomeCents, filingStatus, creditKeys, prsiClass } = params;

  const cutOffCents = rates.incomeTax.cutOffPointsCents[filingStatus];
  const standardBandCents = Math.min(grossIncomeCents, cutOffCents);
  const higherBandCents = Math.max(0, grossIncomeCents - cutOffCents);

  const grossIncomeTaxCents =
    Math.round(standardBandCents * rates.incomeTax.rates.standard) +
    Math.round(higherBandCents * rates.incomeTax.rates.higher);

  const totalCreditsCents = creditKeys.reduce((sum, key) => {
    const credit = rates.taxCreditsCents[key];
    return sum + credit;
  }, 0);

  const incomeTaxCents = Math.max(0, grossIncomeTaxCents - totalCreditsCents);
  const uscCents = calculateUSC(grossIncomeCents, rates.usc);
  const prsiCents = calculatePRSI(grossIncomeCents, prsiClass, rates.prsi);

  const totalDeductionsCents = incomeTaxCents + uscCents + prsiCents;
  const netIncomeCents = grossIncomeCents - totalDeductionsCents;

  return {
    grossIncomeCents,
    grossIncomeTaxCents,
    totalCreditsCents,
    incomeTaxCents,
    uscCents,
    prsiCents,
    totalDeductionsCents,
    netIncomeCents,
  };
}
