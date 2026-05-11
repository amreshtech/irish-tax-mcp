import type { CgtParams, CgtResult, TaxRates } from './types.js';

export function calculateCgt(params: CgtParams, rates: TaxRates): CgtResult {
  const { gainCents } = params;
  const { rate, annualExemptionCents } = rates.cgt;

  const annualExemptionAppliedCents = Math.min(gainCents, annualExemptionCents);
  const taxableGainCents = Math.max(0, gainCents - annualExemptionCents);
  const cgtDueCents = Math.round(taxableGainCents * rate);

  return {
    gainCents,
    annualExemptionAppliedCents,
    taxableGainCents,
    cgtDueCents,
    rate,
  };
}
