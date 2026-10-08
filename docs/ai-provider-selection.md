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

---

## 3. Decision

> **We select Google Gemini (Flash tier) as the AI provider: `AI_PROVIDER=gemini`.**
> `AI_PROVIDER=fake` remains the default locally and in CI, so nobody needs a key to
> develop. **Groq is the approved alternate** — documented here, not yet implemented.

### Why Gemini

1. **It is the only free option with first-class structured output.** R1 and R2 are
   both non-negotiable, and Gemini is the one provider on the list that meets both
   natively (`responseSchema` constrains decoding to the #95 schema, which removes
   whole classes of malformed-response bugs handled in #108).
2. **No architecture change.** [Backend Architecture](./backend-architecture.md) §7
   already anticipates `gemini_provider.py` and a `gemini` value for `AI_PROVIDER`.
   Selecting Gemini means #96 implements the existing plan instead of revising it.
3. **Enough quota for the Voyage.** Flash-tier free quotas are project-scoped and
   published in AI Studio; they comfortably cover the team's testing plus a demo, and
   #107/#111 already tell us how to behave when a 429 does arrive.
4. **Low implementation cost.** Official `google-genai` Python SDK, plus an
   OpenAI-compatible endpoint if we ever want to switch clients without changing the
   adapter's shape.
5. **A clean upgrade path.** If we outgrow the free tier, linking a billing account
   moves the same project to Tier 1 — same key, same model, higher limits, and prompts
   stop being used for product improvement.

### Alternatives rejected

| Alternative | Why not now |
| :--- | :--- |
| Groq | Meets every requirement except that the free catalogue is open-weight models only and schema adherence varies by model. Approved as the fallback: adding it later is one provider file, one factory branch, one env var (§7 of the architecture doc). |
| OpenRouter | 50 free requests/day, a free roster that is replaced regularly, and per-model structured-output support — too much variability for a frozen schema. |
| OpenAI | No free API tier; would put a real cost on every test run (R1). Remains a valid future value of `AI_PROVIDER`. |
| Anthropic | Same reason — no free API tier. |
| Ollama | Unbounded, unpredictable latency and nothing running if a laptop sleeps during the demo (R4). Useful for local experiments only. |

---

## 4. Environment Variables

These are the variables #93 requires us to know (acceptance criterion 3). They extend
the configuration table in [Backend Architecture](./backend-architecture.md) §9; nothing
there is removed.

| Variable | Required | Local default | Example | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `AI_PROVIDER` | Always | `fake` | `gemini` | `fake` \| `gemini` (`openai` reserved for a future adapter). Selects the adapter in `api/dependencies.py`. |
| `AI_API_KEY` | When `AI_PROVIDER != fake` | — | `<gemini api key>` | Server-side only. Never logged, never returned, never sent to the frontend. |
| `AI_MODEL` | Recommended | `fake-model` | `gemini-flash-latest` | Alias tracks the current Flash release with 2 weeks' notice; pin an exact id (e.g. `gemini-3.5-flash`) for reproducible builds. Confirm the current stable Flash id in AI Studio when #96 lands. |
| `AI_TIMEOUT_SECONDS` | Recommended | `30` | `30` | Bounds one generation call; the value #109 tests against. |
| `AI_MAX_RETRIES` | Optional | `0` | `2` | Bounded backoff on 429/5xx before raising `AIProviderError` (#107–#109). |

Where they live:

- `backend/.env.example` documents every variable with a placeholder — committed.
- `backend/.env` holds real values — gitignored, never committed (checked by the
  security scan, #280).
- The deployed environment gets the same variables from its secret store (GitHub
  Actions secrets / host env), not from the repository.
- `core/config.py` reads and validates them once at startup, so a missing `AI_API_KEY`
  fails at boot rather than on the first user request.

---

## 5. Operating Rules

**Key handling** (issue #93: *do not expose provider API keys to the frontend*):

1. The key exists only in the backend environment. The frontend has no AI variables at
   all — generation happens exclusively through `POST /api/learning-paths` (#97).
2. The provider SDK is imported only under `infrastructure/ai/providers/`
   (architecture §4.5, §4.7). A service or router importing `google.genai` is a bug.
3. Keys and raw provider payloads are never logged or returned; logging redaction is
   the responsibility of `core/logging.py` (architecture §6).
4. Use separate keys for development and production, and rotate immediately if one is
   committed.

**Rate limits and errors**:

- A 429 from the provider is retried with bounded backoff (up to `AI_MAX_RETRIES`),
  then surfaced as `RateLimitError` → HTTP 429 in the standard error envelope — the
  user sees "please retry", never a provider message.
- A timeout or malformed response becomes `AIProviderError` → HTTP 502; a partially
  generated path is never persisted (#107–#109).
- CI and local development run on `fake`, so tests never consume quota and never need
  a key.

---

## 6. Definition of Done for this Issue

- [x] Provider is selected — Gemini Flash (`AI_PROVIDER=gemini`) — §3
- [x] Reason for selection is documented — §3
- [x] Required environment variables are known — §4
- [ ] Reviewed and approved by the team
- [ ] Reviewed against #96 when the adapter is implemented (update model id and limits
      if they have changed)

## 7. Related Issues

| Issue | Relationship |
| :--- | :--- |
| #60 | Parent epic — *AI Learning Path Generation* |
| #94 / #95 | Prompt and structured response schema — consume §5 and the selected model |
| #96 | Implement AI client/service — implements this decision |
| #97 | Generate learning path endpoint — the only caller of the provider |
| #107–#109 | Provider error, malformed response, timeout — realise §5 |
| #22 | Backend architecture — the seam this decision plugs into (§7) |

## 8. Sources

Verified September 2026; re-check before changing provider.

- Gemini API rate limits — ai.google.dev/gemini-api/docs/rate-limits
- Gemini API pricing (free vs paid tier) — ai.google.dev/gemini-api/docs/pricing
- Gemini models (structured output, current Flash ids) — ai.google.dev/gemini-api/docs/models
- Groq rate limits (free plan) — console.groq.com/docs/rate-limits
- OpenRouter free models and limits — openrouter.ai/docs/limits
