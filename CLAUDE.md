# Irish Tax MCP Project

## Mission
Build a deterministic Irish tax calculation and reference service.

## Non-negotiables
- Never use LLM arithmetic for tax outputs.
- All calculations must be code-driven and test-covered.
- All monetary inputs and outputs are in euro cents unless explicitly labeled otherwise.
- Keep scope honest; do not claim licensed-accountant status.
- Prefer lean implementation over speculative architecture.

## Main packages
- `packages/core`: exact tax calculators
- `packages/reference`: year-versioned reference data
- `worker`: Cloudflare Worker public API
- `skills/irish-tax`: modular skill package for agent use

## Quality bar
- Preserve integer-cent arithmetic.
- Add tests for any calculator change.
- Keep tool input/output schemas explicit.
- Update docs when public behavior changes.

## Public safety
Every public-facing response should make clear that:
- output is informational
- material decisions should be checked with Revenue or a qualified professional
- unsupported reliefs or edge cases are out of scope
