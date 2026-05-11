import type { VatParams, VatResult, TaxRates } from './types.js';

export function calculateVat(params: VatParams, rates: TaxRates): VatResult {
  const { amountCents, vatCode, direction } = params;
  const rate = rates.vat.rates[vatCode];

  let netCents: number;
  let vatCents: number;
  let grossCents: number;

  if (direction === 'exclusive') {
    netCents = amountCents;
    vatCents = Math.round(amountCents * rate);
    grossCents = netCents + vatCents;
  } else {
    grossCents = amountCents;
    netCents = Math.round(amountCents / (1 + rate));
    vatCents = grossCents - netCents;
  }

  return { netCents, vatCents, grossCents, rate, vatCode };
}
