import { calculateIncomeTax, calculateVat, calculateCgt } from '@irish-tax-mcp/core';
import type { TaxCreditKey } from '@irish-tax-mcp/core';
import { getRates, getTopicReference } from '@irish-tax-mcp/reference';
import type { ReferenceTopics } from '@irish-tax-mcp/reference';
import { TOOL_LIST } from './tools.js';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
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

function handleToolCall(name: string, input: Record<string, unknown>): unknown {
  const year = typeof input['year'] === 'number' ? input['year'] : 2025;
  const rates = getRates(year);

  switch (name) {
    case 'calculate_income_tax': {
      const params = {
        grossIncomeCents: input['grossIncomeCents'] as number,
        filingStatus: input['filingStatus'] as 'single' | 'married_one_income' | 'married_two_incomes' | 'widowed',
        creditKeys: input['creditKeys'] as TaxCreditKey[],
        prsiClass: input['prsiClass'] as 'A' | 'S' | 'D',
      };
      const result = calculateIncomeTax(params, rates);
      return {
        ...result,
        grossIncomeEur: result.grossIncomeCents / 100,
        netIncomeEur: result.netIncomeCents / 100,
        incomeTaxEur: result.incomeTaxCents / 100,
        uscEur: result.uscCents / 100,
        prsiEur: result.prsiCents / 100,
        totalDeductionsEur: result.totalDeductionsCents / 100,
        effectiveRate: result.totalDeductionsCents / result.grossIncomeCents,
        year,
      };
    }

    case 'calculate_vat': {
      const params = {
        amountCents: input['amountCents'] as number,
        vatCode: input['vatCode'] as 'A' | 'B' | 'C' | 'D',
        direction: input['direction'] as 'exclusive' | 'inclusive',
      };
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
      const params = { gainCents: input['gainCents'] as number };
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

    case 'tax_reference_lookup': {
      const topic = input['topic'] as ReferenceTopics;
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
      return new Response(
        JSON.stringify({ status: 'ok', service: 'irish-tax-mcp', version: '1.0.0' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders() } },
      );
    }

    if (url.pathname === '/tools/list' && request.method === 'GET') {
      return new Response(JSON.stringify({ tools: TOOL_LIST }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
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
      if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        return mcpError('invalid_request', 'Missing or invalid "input" field — must be an object');
      }

      try {
        const result = handleToolCall(name, input as Record<string, unknown>);
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
