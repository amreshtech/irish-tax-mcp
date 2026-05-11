import { describe, it, expect } from 'vitest';
import { calculateVat } from '../src/vat.js';
import { rates2025 } from './fixtures/rates.js';

describe('calculateVat', () => {
  it('standard rate 23%, exclusive — €100 net', () => {
    const r = calculateVat({ amountCents: 10_000, vatCode: 'A', direction: 'exclusive' }, rates2025);
    expect(r.netCents).toBe(10_000);
    expect(r.vatCents).toBe(2_300);
    expect(r.grossCents).toBe(12_300);
    expect(r.rate).toBe(0.23);
  });

  it('standard rate 23%, inclusive — €123 gross', () => {
    const r = calculateVat({ amountCents: 12_300, vatCode: 'A', direction: 'inclusive' }, rates2025);
    expect(r.grossCents).toBe(12_300);
    expect(r.netCents).toBe(10_000);
    expect(r.vatCents).toBe(2_300);
  });

  it('reduced rate 13.5%, exclusive — €200 net', () => {
    const r = calculateVat({ amountCents: 20_000, vatCode: 'B', direction: 'exclusive' }, rates2025);
    expect(r.vatCents).toBe(2_700); // 13.5% × 200 = 27.00
    expect(r.grossCents).toBe(22_700);
  });

  it('second reduced rate 9%, exclusive — €100 net', () => {
    const r = calculateVat({ amountCents: 10_000, vatCode: 'C', direction: 'exclusive' }, rates2025);
    expect(r.vatCents).toBe(900);
    expect(r.grossCents).toBe(10_900);
  });

  it('zero rate — no VAT', () => {
    const r = calculateVat({ amountCents: 10_000, vatCode: 'D', direction: 'exclusive' }, rates2025);
    expect(r.vatCents).toBe(0);
    expect(r.grossCents).toBe(10_000);
  });

  it('inclusive extraction preserves gross amount', () => {
    const r = calculateVat({ amountCents: 10_900, vatCode: 'C', direction: 'inclusive' }, rates2025);
    expect(r.grossCents).toBe(10_900);
    expect(r.netCents + r.vatCents).toBe(10_900);
  });
});
