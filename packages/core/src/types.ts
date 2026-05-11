export type FilingStatus =
  | 'single'
  | 'married_one_income'
  | 'married_two_incomes'
  | 'widowed';

export type PrsiClass = 'A' | 'S' | 'D';

export type VatCode = 'A' | 'B' | 'C' | 'D';

export type VatDirection = 'exclusive' | 'inclusive';

export type TaxCreditKey =
  | 'personal_single'
  | 'personal_married'
  | 'paye'
  | 'earned_income'
  | 'home_carer'
  | 'single_person_child_carer';

export interface TaxBand {
  widthCents: number | null;
  rate: number;
}

export interface IncomeTaxRates {
  rates: { standard: number; higher: number };
  cutOffPointsCents: Record<FilingStatus, number>;
}

export interface UscRates {
  exemptionThresholdCents: number;
  bands: TaxBand[];
}

export interface PrsiRates {
  classA: { weeklyExemptionCents: number; rate: number };
  classS: { incomeThresholdCents: number; minimumAnnualCents: number; rate: number };
  classD: { rate: number };
}

export interface CgtRates {
  rate: number;
  annualExemptionCents: number;
}

export interface VatRates {
  rates: Record<VatCode, number>;
  descriptions: Record<VatCode, string>;
}

export interface TaxRates {
  year: number;
  incomeTax: IncomeTaxRates;
  usc: UscRates;
  prsi: PrsiRates;
  taxCreditsCents: Record<TaxCreditKey, number>;
  cgt: CgtRates;
  vat: VatRates;
}

export interface IncomeTaxParams {
  grossIncomeCents: number;
  filingStatus: FilingStatus;
  creditKeys: TaxCreditKey[];
  prsiClass: PrsiClass;
}

export interface IncomeTaxResult {
  grossIncomeCents: number;
  grossIncomeTaxCents: number;
  totalCreditsCents: number;
  incomeTaxCents: number;
  uscCents: number;
  prsiCents: number;
  totalDeductionsCents: number;
  netIncomeCents: number;
}

export interface VatParams {
  amountCents: number;
  vatCode: VatCode;
  direction: VatDirection;
}

export interface VatResult {
  netCents: number;
  vatCents: number;
  grossCents: number;
  rate: number;
  vatCode: VatCode;
}

export interface CgtParams {
  gainCents: number;
}

export interface CgtResult {
  gainCents: number;
  annualExemptionAppliedCents: number;
  taxableGainCents: number;
  cgtDueCents: number;
  rate: number;
}
