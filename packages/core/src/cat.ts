import type { CatParams, CatResult, TaxRates } from './types.js';

export function calculateCat(params: CatParams, rates: TaxRates): CatResult {
  const {
    benefitCents,
    group,
    priorTaxableBenefitsCents = 0,
    applySmallGiftExemption = false,
  } = params;

  const thresholdCents = rates.cat.thresholdsCents[group];
  const smallGiftExemptionAppliedCents = applySmallGiftExemption
    ? Math.min(benefitCents, rates.cat.smallGiftExemptionCents)
    : 0;
  const taxableBenefitAfterExemptionCents = Math.max(0, benefitCents - smallGiftExemptionAppliedCents);
  const thresholdRemainingBeforeBenefitCents = Math.max(0, thresholdCents - priorTaxableBenefitsCents);
  const thresholdConsumedCents = Math.min(
    taxableBenefitAfterExemptionCents,
    thresholdRemainingBeforeBenefitCents,
  );
  const remainingThresholdCents = Math.max(
    0,
    thresholdRemainingBeforeBenefitCents - taxableBenefitAfterExemptionCents,
  );
  const taxableAmountCents = Math.max(
    0,
    taxableBenefitAfterExemptionCents - thresholdRemainingBeforeBenefitCents,
  );
  const catDueCents = Math.round(taxableAmountCents * rates.cat.rate);

  return {
    benefitCents,
    group,
    priorTaxableBenefitsCents,
    thresholdCents,
    smallGiftExemptionAppliedCents,
    taxableBenefitAfterExemptionCents,
    thresholdConsumedCents,
    remainingThresholdCents,
    taxableAmountCents,
    catDueCents,
    rate: rates.cat.rate,
  };
}
