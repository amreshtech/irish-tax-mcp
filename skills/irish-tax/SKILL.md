---
name: irish-tax
description: "Irish tax skill pack for deterministic calculations, references, and safe workflows."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [finance, tax, ireland, calculators, compliance]
---

# Irish Tax Skill Pack

Use this skill when the user asks for Irish tax help.

## Purpose
Provide a finance-style modular skill pack that separates:
- deterministic calculations
- tax reference lookup
- workflow guidance
- limitations and escalation rules

## Rules
1. Never do Irish tax arithmetic in the LLM.
2. Use code or MCP tools for all calculations.
3. Surface the supported tax year.
4. Surface limitations before users rely on outputs.
5. Escalate to a qualified professional for judgement-heavy issues.

## Included modules
- `references/tax-scope.md`
- `references/supported-scenarios.md`
- `templates/client-questionnaire.md`
- `scripts/checklist.md`

## Recommended workflow
1. Clarify the tax year.
2. Identify scenario type: PAYE, self-employed, VAT, CGT, reference lookup.
3. Use deterministic tool outputs.
4. Summarize assumptions in plain English.
5. State unsupported areas explicitly.

## Out-of-scope examples
- treaty interpretation
- anti-avoidance planning
- SARP and advanced relief optimisation
- regulated filing advice
