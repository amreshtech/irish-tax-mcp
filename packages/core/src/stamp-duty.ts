import type { StampDutyParams, StampDutyResult, TaxBand, TaxRates } from './types.js';

function applyBands(amountCents: number, bands: TaxBand[]): number {
  let remaining = amountCents;
  let dutyCents = 0;

  for (const band of bands) {
    if (remaining <= 0) break;
    const inBand = band.widthCents === null ? remaining : Math.min(remaining, band.widthCents);
    dutyCents += Math.round(inBand * band.rate);
    remaining -= inBand;
  }

  return dutyCents;
}

export function calculateStampDuty(
  params: StampDutyParams,
  rates: TaxRates,
): StampDutyResult {
  const { considerationCents, propertyType } = params;

  const dutyDueCents =
    propertyType === 'residential'
      ? applyBands(considerationCents, rates.stampDuty.residential)
      : propertyType === 'non_residential'
        ? Math.round(considerationCents * rates.stampDuty.nonResidential)
        : Math.round(considerationCents * rates.stampDuty.shares);

  return {
    considerationCents,
    propertyType,
    dutyDueCents,
    effectiveRate: considerationCents === 0 ? 0 : dutyDueCents / considerationCents,
  };
}
