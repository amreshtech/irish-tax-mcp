export const TOOL_LIST = [
  {
    name: 'calculate_income_tax',
    description:
      'Calculate Irish income tax (IT), USC, and PRSI for a given gross income, filing status, tax credits, and PRSI class. All monetary amounts are in euro cents.',
    inputSchema: {
      type: 'object',
      required: ['grossIncomeCents', 'filingStatus', 'creditKeys', 'prsiClass'],
      properties: {
        year: {
          type: 'integer',
          description: 'Tax year. Defaults to 2025.',
          default: 2025,
        },
        grossIncomeCents: {
          type: 'integer',
          description: 'Annual gross income in euro cents (e.g. 5000000 = €50,000).',
        },
        filingStatus: {
          type: 'string',
          enum: ['single', 'married_one_income', 'married_two_incomes', 'widowed'],
          description: 'Filing status for standard-rate cut-off point selection.',
        },
        creditKeys: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'personal_single',
              'personal_married',
              'paye',
              'earned_income',
              'home_carer',
              'single_person_child_carer',
            ],
          },
          description:
            'Tax credit keys to apply. E.g. ["personal_single","paye"] for a standard PAYE employee.',
        },
        prsiClass: {
          type: 'string',
          enum: ['A', 'S', 'D'],
          description: 'PRSI class: A = employed, S = self-employed, D = pre-1995 public servant.',
        },
      },
    },
  },
  {
    name: 'calculate_vat',
    description:
      'Calculate Irish VAT for a given amount and VAT code, either adding VAT to a net amount (exclusive) or extracting it from a gross amount (inclusive).',
    inputSchema: {
      type: 'object',
      required: ['amountCents', 'vatCode', 'direction'],
      properties: {
        year: { type: 'integer', description: 'Tax year. Defaults to 2025.', default: 2025 },
        amountCents: {
          type: 'integer',
          description: 'Amount in euro cents.',
        },
        vatCode: {
          type: 'string',
          enum: ['A', 'B', 'C', 'D'],
          description:
            'VAT rate code: A=23% (standard), B=13.5% (reduced), C=9% (second reduced), D=0% (zero).',
        },
        direction: {
          type: 'string',
          enum: ['exclusive', 'inclusive'],
          description:
            'exclusive = amountCents is net, add VAT. inclusive = amountCents is gross, extract VAT.',
        },
      },
    },
  },
  {
    name: 'calculate_cgt',
    description:
      'Calculate Irish Capital Gains Tax (CGT) on a capital gain, applying the annual personal exemption.',
    inputSchema: {
      type: 'object',
      required: ['gainCents'],
      properties: {
        year: { type: 'integer', description: 'Tax year. Defaults to 2025.', default: 2025 },
        gainCents: {
          type: 'integer',
          description: 'Total capital gain in euro cents before exemption.',
        },
      },
    },
  },
  {
    name: 'tax_reference_lookup',
    description:
      'Look up Irish tax reference data (rates, thresholds, credits) for a given topic and year.',
    inputSchema: {
      type: 'object',
      required: ['topic'],
      properties: {
        year: { type: 'integer', description: 'Tax year. Defaults to 2025.', default: 2025 },
        topic: {
          type: 'string',
          enum: ['income_tax', 'usc', 'prsi', 'tax_credits', 'cgt', 'vat', 'stamp_duty'],
          description: 'The tax topic to retrieve reference data for.',
        },
      },
    },
  },
] as const;
