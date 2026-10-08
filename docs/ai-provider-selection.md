# AI Provider Selection

**Issue:** #93 — Select AI provider
**Milestone:** Sprint 3
**Status:** Proposed (needs team review & sign-off)
**Scope:** Which AI provider the FastAPI backend calls to generate learning paths

---

## 1. Purpose

This document evaluates the AI providers we could use for learning path generation,
selects one, and records the environment variables that selection requires.

It closes the "Choosing the AI provider (see #93)" non-goal left open by
[Backend Architecture](./backend-architecture.md) §1.2. That document already defines
*where* a provider plugs in (the `LearningPathGenerator` Protocol, §7); this document
decides *which* provider fills that slot.

Acceptance criteria of #93 this document must satisfy:

1. A provider is selected.
2. The reason for the selection is documented.
3. The required environment variables are known.

### Requirements

These come from #93 itself, from the architecture document, and from the reality that
four people are building this during a Voyage with no budget.

| # | Requirement | Source |
|---| :--- | :--- |
| R1 | Usable at no cost during development and demo — free tier that works without a credit card | #93 (free-tier limits) |
| R2 | Structured output: the model must be able to return JSON conforming to the schema defined in #95 | #93 (structured output support) |
| R3 | Rate limits high enough for the team's testing and a demo with several users at once | #93 (rate limits) |
| R4 | Predictable, bounded latency so generation feels instant enough and #109 can set a sane timeout | #93 (latency) |
| R5 | API key authenticates from the backend only — it never reaches the browser | #93 (authentication), #22 G2 |
| R6 | Maintained client: official Python SDK or an OpenAI-compatible REST API, documented limits | #96 implementation cost |
| R7 | Quota and pricing behaviour are published, so we are never surprised by a bill | team risk |

---

## 2. Candidates Considered

Providers were checked against their own documentation in September 2026. Free-tier
limits move frequently; the numbers below are the ones we verified and should be
re-checked if we change provider.

| Provider | Free tier (no credit card) | Structured output | Free-tier limits | Auth | Latency |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Gemini (Flash)** | Yes — quotas shown per model in AI Studio | Yes — native schema-constrained output (`responseSchema` + JSON response MIME type) | Per model, project-scoped RPM/TPM/RPD; Flash models are in the hundreds to ~1,500 requests/day range | API key, server-side; official `google-genai` SDK, plus an OpenAI-compatible endpoint | Fast tier; hundreds of tokens/second |
| **Groq** | Yes | Yes — JSON schema supported | Free plan: 30 RPM, 1,000 RPD, 8K TPM, 200K TPD per model (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`) | API key, server-side; OpenAI-compatible API and native SDK | Fastest option (LPU hardware) |
| **OpenRouter** | Yes — only on `:free` models | Varies by model | 20 RPM, 50 requests/day (1,000/day after a one-time $10 top-up) | One API key, server-side; OpenAI-compatible | Depends on the routed model |
| **OpenAI** | No — API access is prepaid/credit based | Yes — strict schema support | n/a | Paid | Fast |
| **Anthropic** | No — trial credits ended | Yes | n/a | Paid | Fast |
| **Ollama (self-hosted)** | Yes (hardware we already own) | Partial — depends on the local model | Limited by our laptops; nothing runs during a demo if a laptop sleeps | No remote key | Unpredictable |

Notes on the shortlist:

- **Gemini** is the only candidate that satisfies R1 and R2 at the same time with a
  first-class, vendor-maintained structured output mode. Free-tier prompts may be used
  by Google to improve its products; enabling paid Tier 1 turns that off.
- **Groq** has the clearest published free-tier numbers and the lowest latency, but its
  free catalogue is open-weight models only, and schema adherence is model-dependent.
  It is the natural fallback if Gemini quotas become a problem.
- **OpenRouter** gives the widest model choice behind one key, but the free roster and
  its 50 requests/day quota change often, and structured output support differs per
  model — the wrong kind of variability for a contract we want to freeze in #95.
- **OpenAI / Anthropic** are excellent on output quality but have no free API tier, so
  they fail R1 for a Voyage project with no budget.
