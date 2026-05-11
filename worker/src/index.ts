import {
  calculateAnnualPersonalTax,
  calculateCat,
  calculateCgt,
  calculateIncomeTax,
  calculateStampDuty,
  calculateVat,
} from '@irish-tax-mcp/core';
import { getRates, getTopicReference } from '@irish-tax-mcp/reference';
import { TOOL_LIST } from './tools.js';
import {
  parseCalculateAnnualPersonalTax,
  parseCalculateCat,
  parseCalculateCgt,
  parseCalculateIncomeTax,
  parseCalculateStampDuty,
  parseCalculateVat,
  parseReferenceLookup,
} from './validation.js';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function mcpError(code: string, message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function handleToolCall(name: string, input: unknown): unknown {
  switch (name) {
    case 'calculate_income_tax': {
      const { year, params } = parseCalculateIncomeTax(input);
      const rates = getRates(year);
      const result = calculateIncomeTax(params, rates);
      return {
        ...result,
        grossIncomeEur: result.grossIncomeCents / 100,
        netIncomeEur: result.netIncomeCents / 100,
        incomeTaxEur: result.incomeTaxCents / 100,
        uscEur: result.uscCents / 100,
        prsiEur: result.prsiCents / 100,
        totalDeductionsEur: result.totalDeductionsCents / 100,
        effectiveRate: result.grossIncomeCents === 0 ? 0 : result.totalDeductionsCents / result.grossIncomeCents,
        year,
      };
    }

    case 'calculate_annual_personal_tax': {
      const { year, params } = parseCalculateAnnualPersonalTax(input);
      const rates = getRates(year);
      const result = calculateAnnualPersonalTax(params, rates);
      return {
        ...result,
        totalGrossIncomeEur: result.totalGrossIncomeCents / 100,
        grossIncomeTaxEur: result.grossIncomeTaxCents / 100,
        incomeTaxEur: result.incomeTaxCents / 100,
        uscEur: result.uscCents / 100,
        prsiEur: result.prsiCents / 100,
        totalDeductionsEur: result.totalDeductionsCents / 100,
        netIncomeEur: result.netIncomeCents / 100,
        year,
      };
    }

    case 'calculate_vat': {
      const { year, params } = parseCalculateVat(input);
      const rates = getRates(year);
      const result = calculateVat(params, rates);
      return {
        ...result,
        netEur: result.netCents / 100,
        vatEur: result.vatCents / 100,
        grossEur: result.grossCents / 100,
        ratePercent: `${result.rate * 100}%`,
        year,
      };
    }

    case 'calculate_cgt': {
      const { year, params } = parseCalculateCgt(input);
      const rates = getRates(year);
      const result = calculateCgt(params, rates);
      return {
        ...result,
        gainEur: result.gainCents / 100,
        annualExemptionAppliedEur: result.annualExemptionAppliedCents / 100,
        taxableGainEur: result.taxableGainCents / 100,
        cgtDueEur: result.cgtDueCents / 100,
        ratePercent: `${result.rate * 100}%`,
        year,
      };
    }

    case 'calculate_stamp_duty': {
      const { year, params } = parseCalculateStampDuty(input);
      const rates = getRates(year);
      const result = calculateStampDuty(params, rates);
      return {
        ...result,
        considerationEur: result.considerationCents / 100,
        dutyDueEur: result.dutyDueCents / 100,
        effectiveRatePercent: `${(result.effectiveRate * 100).toFixed(3)}%`,
        year,
      };
    }

    case 'calculate_cat': {
      const { year, params } = parseCalculateCat(input);
      const rates = getRates(year);
      const result = calculateCat(params, rates);
      return {
        ...result,
        benefitEur: result.benefitCents / 100,
        thresholdEur: result.thresholdCents / 100,
        taxableAmountEur: result.taxableAmountCents / 100,
        catDueEur: result.catDueCents / 100,
        remainingThresholdEur: result.remainingThresholdCents / 100,
        ratePercent: `${result.rate * 100}%`,
        year,
      };
    }

    case 'tax_reference_lookup': {
      const { topic, year } = parseReferenceLookup(input);
      return getTopicReference(topic, year);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (url.pathname === '/health') {
      return json({ status: 'ok', service: 'irish-tax-mcp', version: '1.0.0' });
    }

    if (url.pathname === '/tools/list' && request.method === 'GET') {
      return json({ tools: TOOL_LIST });
    }

    if (url.pathname === '/tools/call' && request.method === 'POST') {
      let body: { name?: unknown; input?: unknown };
      try {
        body = await request.json();
      } catch {
        return mcpError('invalid_request', 'Request body must be valid JSON');
      }

      const { name, input } = body;
      if (typeof name !== 'string') {
        return mcpError('invalid_request', 'Missing or invalid "name" field');
      }

      try {
        const result = handleToolCall(name, input);
        return json({ content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.startsWith('Unknown tool:')) {
          return mcpError('unknown_tool', message, 404);
        }
        return mcpError('tool_error', message, 422);
      }
    }

    return mcpError('not_found', `No route for ${request.method} ${url.pathname}`, 404);
  },
};
