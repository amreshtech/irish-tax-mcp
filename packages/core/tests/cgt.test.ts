import { describe, it, expect } from 'vitest';
import { calculateCgt } from '../src/cgt.js';
import { rates2025 } from './fixtures/rates.js';

describe('calculateCgt', () => {
  it('gain of €20,000 — applies annual exemption and 33% rate', () => {
    const r = calculateCgt({ gainCents: 2_000_000 }, rates2025);
    expect(r.annualExemptionAppliedCents).toBe(127_000);
    expect(r.taxableGainCents).toBe(1_873_000);  // 2,000,000 - 127,000
    expect(r.cgtDueCents).toBe(618_090);          // round(1,873,000 × 0.33)
    expect(r.rate).toBe(0.33);
  });

  it('gain below annual exemption (€1,000) — no CGT due', () => {
    const r = calculateCgt({ gainCents: 100_000 }, rates2025);
    expect(r.annualExemptionAppliedCents).toBe(100_000);
    expect(r.taxableGainCents).toBe(0);
    expect(r.cgtDueCents).toBe(0);
  });

  it('gain exactly equal to annual exemption (€1,270) — no CGT due', () => {
    const r = calculateCgt({ gainCents: 127_000 }, rates2025);
    expect(r.taxableGainCents).toBe(0);
    expect(r.cgtDueCents).toBe(0);
  });

  it('gain of €1 above exemption — minimal CGT', () => {
    const r = calculateCgt({ gainCents: 127_001 }, rates2025);
    expect(r.taxableGainCents).toBe(1);
    // round(1 × 0.33) = 0 (rounds down)
    expect(r.cgtDueCents).toBe(0);
  });

  it('large gain of €500,000', () => {
    const r = calculateCgt({ gainCents: 50_000_000 }, rates2025);
    expect(r.taxableGainCents).toBe(49_873_000);
    expect(r.cgtDueCents).toBe(Math.round(49_873_000 * 0.33));
  });

  it('zero gain — no CGT', () => {
    const r = calculateCgt({ gainCents: 0 }, rates2025);
    expect(r.taxableGainCents).toBe(0);
    expect(r.cgtDueCents).toBe(0);
    expect(r.annualExemptionAppliedCents).toBe(0);
  });
});
