import type {
  AnnualPersonalTaxParams,
  AnnualPersonalTaxResult,
  PersonalTaxIncomeSourceKind,
  PrsiClass,
  TaxBand,
  TaxCreditKey,
  TaxRates,
} from './types.js';

function applyBands(amountCents: number, bands: TaxBand[]): number {
  let taxCents = 0;
  let remaining = amountCents;

  for (const band of bands) {
    if (remaining <= 0) break;
    const inBand = band.widthCents === null ? remaining : Math.min(remaining, band.widthCents);
    taxCents += Math.round(inBand * band.rate);
    remaining -= inBand;
  }

  return taxCents;
}

function calculatePrsiForClass(grossIncomeCents: number, prsiClass: PrsiClass, rates: TaxRates): number {
  if (prsiClass === 'A') {
    const annualThresholdCents = rates.prsi.classA.weeklyExemptionCents * 52;
    if (grossIncomeCents <= annualThresholdCents) return 0;
    return Math.round(grossIncomeCents * rates.prsi.classA.rate);
  }

  if (prsiClass === 'S') {
    if (grossIncomeCents <= rates.prsi.classS.incomeThresholdCents) return 0;
    return Math.max(
      rates.prsi.classS.minimumAnnualCents,
      Math.round(grossIncomeCents * rates.prsi.classS.rate),
    );
  }

  return Math.round(grossIncomeCents * rates.prsi.classD.rate);
}

function defaultPrsiClassForKind(kind: PersonalTaxIncomeSourceKind): PrsiClass | null {
  if (kind === 'employment') return 'A';
  if (kind === 'self_employment') return 'S';
  return null;
}

function sumCredits(creditKeys: TaxCreditKey[], rates: TaxRates): number {
  return creditKeys.reduce((sum, key) => sum + rates.taxCreditsCents[key], 0);
}

export function calculateAnnualPersonalTax(
  params: AnnualPersonalTaxParams,
  rates: TaxRates,
): AnnualPersonalTaxResult {
  const sourceTotalsCents: Record<PersonalTaxIncomeSourceKind, number> = {
    employment: 0,
    self_employment: 0,
    pension: 0,
    other: 0,
  };

  const prsiByClassCents: Record<PrsiClass, number> = {
    A: 0,
    S: 0,
    D: 0,
  };

  for (const source of params.incomeSources) {
    sourceTotalsCents[source.kind] += source.grossIncomeCents;
    const prsiClass = source.prsiClass ?? defaultPrsiClassForKind(source.kind);
    if (prsiClass !== null) {
      prsiByClassCents[prsiClass] += calculatePrsiForClass(source.grossIncomeCents, prsiClass, rates);
    }
  }

  const totalGrossIncomeCents = params.incomeSources.reduce(
    (sum, source) => sum + source.grossIncomeCents,
    0,
  );

  const cutOffCents = rates.incomeTax.cutOffPointsCents[params.filingStatus];
  const standardBandCents = Math.min(totalGrossIncomeCents, cutOffCents);
  const higherBandCents = Math.max(0, totalGrossIncomeCents - cutOffCents);
  const grossIncomeTaxCents =
    Math.round(standardBandCents * rates.incomeTax.rates.standard) +
    Math.round(higherBandCents * rates.incomeTax.rates.higher);

  const totalCreditsCents = sumCredits(params.creditKeys, rates);
  const incomeTaxCents = Math.max(0, grossIncomeTaxCents - totalCreditsCents);
  const uscCents =
    totalGrossIncomeCents <= rates.usc.exemptionThresholdCents
      ? 0
      : applyBands(totalGrossIncomeCents, rates.usc.bands);
  const prsiCents = prsiByClassCents.A + prsiByClassCents.S + prsiByClassCents.D;
  const totalDeductionsCents = incomeTaxCents + uscCents + prsiCents;

  return {
    filingStatus: params.filingStatus,
    totalGrossIncomeCents,
    sourceTotalsCents,
    grossIncomeTaxCents,
    totalCreditsCents,
    incomeTaxCents,
    uscCents,
    prsiByClassCents,
    prsiCents,
    totalDeductionsCents,
    netIncomeCents: totalGrossIncomeCents - totalDeductionsCents,
  };
}
