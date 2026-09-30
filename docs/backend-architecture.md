# Backend Architecture

**Issue:** #22 — Define backend architecture
**Milestone:** Sprint 3
**Status:** Proposed (needs team review & sign-off)
**Scope:** FastAPI backend for the AI learning path generator

---

## 1. Purpose

This document defines the structure and boundaries of our FastAPI backend **before**
feature code is written, so the four of us can develop routers, business logic,
persistence, auth, and AI integration independently without tripping over each other.

It is a **contract**, not a suggestion. If implementation forces a deviation from
this document, the deviation must be recorded in the Team Decision Log and this
document updated in the same PR.

### Goals

| # | Goal |
|---| :--- |
| G1 | A new contributor can predict where a piece of code belongs without asking. |
| G2 | AI provider choice is a configuration detail, not a code dependency. |
| G3 | Business logic is testable without a database, network, or API key. |
| G4 | Frontend and backend can be built in parallel against a stable API shape. |

### Non-goals

- Choosing the AI provider (see #93). This doc only defines the seam where it plugs in.
- Defining the wire format of every endpoint (see #38, API contract).
- Final data model design (see #39, PostgreSQL schema).
- Deployment topology and hosting (see #69, Application Deployment).

---

## 2. Architectural Style

We use a **layered architecture with dependency inversion at the AI boundary**.

Requests flow strictly in one direction. Each layer may only import from layers
*above* it in this diagram (or, equivalently, only *inward* toward the core):

```
   ┌──────────────────────────────────────────────────────┐
   │  api/            Routers, dependencies, error handlers│   HTTP boundary
   ├──────────────────────────────────────────────────────┤
   │  services/       Business logic, use cases, policies  │   application core
   ├──────────────────────────────────────────────────────┤
   │  domain/         Entities, value objects, contracts    │   pure, no I/O
   ├──────────────────────────────────────────────────────┤
   │  infrastructure/ Repositories, AI adapters, auth backends│  external systems
   └──────────────────────────────────────────────────────┘
```

The single most important rule:

> **`domain/` and `services/` never import FastAPI, SQLAlchemy sessions, or any
> provider SDK.** They depend on abstractions (Protocols) defined in the layer itself.
> Concrete implementations live in `infrastructure/` and are injected from `api/`
> (the composition root).

This is what makes G2 and G3 true. Everything else in this document follows from it.

---

## 3. Module Structure

```
backend/
├── pyproject.toml
├── alembic.ini
├── alembic/
│   └── versions/                  # DB migrations (issue #39)
├── .env.example                    # every var documented, no real values
├── app/
│   ├── main.py                     # ASGI entry point, mounts routers
│   ├── core/
│   │   ├── config.py               # pydantic-settings, cached settings
│   │   ├── logging.py              # structured logging + redaction
│   │   ├── errors.py               # domain exception hierarchy
│   │   └── security.py             # password hashing, token helpers
│   ├── domain/
│   │   ├── entities.py             # User, LearningPath, Milestone, Progress
│   │   ├── protocols.py            # Repository / AI provider interfaces
│   │   └── validators.py           # domain invariants, pure functions
│   ├── schemas/
│   │   ├── requests.py             # Pydantic request bodies
│   │   ├── responses.py            # Pydantic response bodies
│   │   └── common.py               # ErrorResponse, Page[T], Money-style value types
│   ├── services/
│   │   ├── learning_path_service.py
│   │   ├── progress_service.py
│   │   └── auth_service.py
│   ├── api/
│   │   ├── dependencies.py         # DI providers — the composition root
│   │   ├── errors.py               # exception → HTTP status mapping
│   │   └── routers/
│   │       ├── health.py
│   │       ├── auth.py
│   │       ├── learning_paths.py
│   │       ├── progress.py
│   │       └── dashboard.py
│   ├── infrastructure/
│   │   ├── db/
│   │   │   ├── session.py          # engine, SessionLocal, get_db dependency
│   │   │   ├── base.py             # Declarative Base
│   │   │   └── models.py           # SQLAlchemy ORM models
│   │   ├── repositories/
│   │   │   ├── user_repository.py
│   │   │   ├── learning_path_repository.py
│   │   │   └── progress_repository.py
│   │   ├── ai/
│   │   │   ├── prompts.py          # prompt templates (issues #94)
│   │   │   ├── parser.py           # raw text → validated domain entity
│   │   │   └── providers/
│   │   │       ├── openai_provider.py
│   │   │       ├── gemini_provider.py
│   │   │       └── fake_provider.py # deterministic, for tests & local dev
│   │   └── auth/
│   │       ├── jwt_backend.py
│   │       └── password_hasher.py
└── tests/
    ├── conftest.py
    ├── unit/                       # no I/O, no network, no fixtures
    │   ├── test_learning_path_service.py
    │   └── test_progress_service.py
    ├── integration/                # real DB (container), routers via TestClient
    └── contract/                   # asserts responses against the #38 contract
```

> **The `fake_provider.py` is not optional.** It is the mechanism that lets the whole
> team develop and test without any provider account, and it is the reference for
> what a provider adapter must do. See §7.

---

## 4. Layer Responsibilities

### 4.1 `api/` — the HTTP boundary

Owns *transport*, nothing else.

**Does:**
- Declare routes, HTTP methods, path parameters.
- Parse and validate input into Pydantic request schemas.
- Resolve dependencies (current user, DB session, services).
- Call **one** service method.
- Translate the returned domain object into a Pydantic response schema.
- Map domain exceptions to HTTP status codes.

**Does not:**
- Contain `if` statements about business rules.
- Touch the DB session directly or build SQL.
- Import a provider SDK.
- Perform multiple service calls to compose one response (that is a service's job).

A router should read like a table of contents:

```python
@router.post("", response_model=LearningPathResponse, status_code=201)
async def create_learning_path(
    payload: GenerateLearningPathRequest,
    service: LearningPathService = Depends(get_learning_path_service),
    current_user: CurrentUser = Depends(get_current_user),
) -> LearningPathResponse:
    path = await service.generate_for_user(current_user.id, payload)
    return LearningPathResponse.from_domain(path)
```

If a router grows past roughly 15 lines or needs a comment to explain *what* it does,
the logic belongs in a service.

### 4.2 `services/` — business logic

Owns *the rules of the product*.

**Does:**
- Orchestrate repositories and the AI provider to fulfil a use case.
- Enforce business rules and invariants (e.g. a milestone cannot precede its parent;
  total estimated hours must not exceed the user's declared commitment).
- Own transactions. One service method = one unit of work.
- Translate infrastructure exceptions into domain exceptions.

**Does not:**
- Import `fastapi`, `Request`, or `Depends`.
- Know that the AI provider is OpenAI, Gemini, or anything else.
- Return HTTP status codes or build response envelopes.

Services receive their collaborators as constructor arguments, so a test passes
fakes:

```python
class LearningPathService:
    def __init__(self, paths: LearningPathRepository, ai: LearningPathGenerator):
        self._paths = paths
        self._ai = ai

    async def generate_for_user(
        self, user_id: UUID, request: GenerateLearningPathRequest
    ) -> LearningPath:
        context = await self._load_context(user_id, request)
        raw = await self._ai.generate(context)
        path = LearningPath.from_generation(raw, context=context)
        return await self._paths.add(path)
```

### 4.3 `domain/` — the core

Pure Python. Fastest to test, slowest to change — which is the point.

- **Entities** are the vocabulary of the product: `LearningPath`, `Milestone`,
  `User`, `ProgressRecord`. They are not ORM rows; they are plain classes with
  behaviour and invariants.
- **Protocols** define what the core needs from the outside world:

  ```python
  class LearningPathRepository(Protocol):
      async def add(self, path: LearningPath) -> LearningPath: ...
      async def get(self, path_id: UUID) -> LearningPath | None: ...
      async def list_for_user(self, user_id: UUID) -> list[LearningPath]: ...

  class LearningPathGenerator(Protocol):
      async def generate(self, context: GenerationContext) -> GeneratedPath: ...
  ```

  These two protocols are the seam that makes G2 true. The core depends on the
  interface; `infrastructure/` supplies the implementation.

- **Validators** are pure functions for rules that are not natural methods on an
  entity (`def milestones_fit_time_budget(path, hours_per_week) -> bool`).

### 4.4 `schemas/` — the wire format

Pydantic models only. Two rules:

1. **Never used in the domain.** A `schemas.Milestone` is not a `domain.Milestone`.
   The mapping happens once, explicitly, in `LearningPathResponse.from_domain(...)`.
   This keeps the API contract (#38) free to change shape without touching business
   rules.
2. **Inbound and outbound are separated.** `requests.py` and `responses.py` never
   share a class, so a field can be required on input and omitted on output without
   contortion.

### 4.5 `infrastructure/` — the outside world

Everything that talks to a real system. The only layer allowed to import SDKs.

- **`db/`** — engine, session lifecycle, ORM models. ORM models are private to this
  layer; repositories translate between rows and domain entities, so a schema change
  does not ripple into `domain/`.
- **`repositories/`** — implement the Protocols in `domain/protocols.py`. One
  repository per aggregate, one public method per use case the service needs.
- **`ai/providers/`** — one class per provider, each implementing
  `LearningPathGenerator`. Provider selection happens in `api/dependencies.py` by
  reading `settings.ai_provider`; no provider module is imported conditionally
  anywhere else.
- **`auth/`** — JWT encode/decode and password hashing. Selected the same way.

### 4.6 `core/` — cross-cutting concerns

Settings, logging, the exception hierarchy, and security helpers. Depends on nothing
above it. `config.py` reads environment variables once at import and validates them
at startup so a missing key fails immediately rather than at 3am on the first request.

### 4.7 Import rules (enforceable)

| Layer | May import |
| :--- | :--- |
| `api/` | `services/`, `schemas/`, `domain/`, `infrastructure/`, `core/` |
| `services/` | `domain/`, `core/` |
| `schemas/` | `core/` |
| `domain/` | `core/` (and stdlib) |
| `infrastructure/` | `domain/`, `core/` |

`infrastructure/` may **not** import `services/` or `api/`; `domain/` may **not**
import `fastapi`, `sqlalchemy`, or any provider package. We will add an import-linter
check to CI to make this a build failure rather than a review comment.

---

## 5. Request Lifecycle

For `POST /api/learning-paths` (issue #97), the full path is:

```
1. CORS / auth middleware            (api/, core/security.py)
2. Route matched                     (api/routers/learning_paths.py)
3. Request parsed & validated        (schemas/requests.py)  -> 422 on failure
4. current_user resolved from JWT    (api/dependencies.py)
5. Service acquired from DI          (api/dependencies.py)
6. use case executed                 (services/learning_path_service.py)
     6a. load user + skill context   (infrastructure/repositories/)
     6b. build GenerationContext     (domain/)
     6c. call generator              (infrastructure/ai/providers/  ← interface, not SDK)
     6d. parse & validate output     (infrastructure/ai/parser.py)
     6e. enforce invariants          (domain/validators.py)
     6f. persist + commit            (infrastructure/repositories/)
7. Domain entity returned
8. Mapped to response schema         (schemas/responses.py)
9. Domain exception -> HTTP status   (api/errors.py)
```

Steps 6c and 6f are the only steps that touch external systems. Everything else is
fast, pure, and testable.

---

## 6. Error Handling

One hierarchy in `core/errors.py`, one mapping table in `api/errors.py`. Services raise
domain errors and never mention HTTP; routers never catch ad-hoc exceptions.

| Domain exception | HTTP | Meaning |
| :--- | :---: | :--- |
| `NotFoundError` | 404 | Entity does not exist or is not visible to the caller |
| `ValidationError` | 422 | Business rule violated (schema validation already handled by FastAPI) |
| `UnauthorizedError` | 401 | Missing or invalid credentials |
| `ForbiddenError` | 403 | Authenticated but not permitted (e.g. someone else's path) |
| `ConflictError` | 409 | Duplicate or conflicting state |
| `RateLimitError` | 429 | Caller exceeded quota |
| `AIProviderError` | 502 | Provider failed, timed out, or returned malformed output |
| `DependencyUnavailableError` | 503 | Database or provider unreachable |

All errors serialise to one envelope so the frontend has a single shape to handle
(locked in by #38):

```json
{ "error": { "code": "ai_provider_error", "message": "Generation failed. Please retry.", "request_id": "..." } }
```

Rules:
- `message` is safe to show a user. Internal detail goes to logs, correlated by `request_id`.
- Provider API keys and raw provider payloads are **never** logged or returned.
- The AI layer retries with bounded backoff, then raises `AIProviderError`; it never
  returns a partially-built path to the user (issues #107–#109).

---

## 7. AI Provider Isolation

This is the constraint the issue calls out explicitly, so it gets its own section.

**All generation goes through the `LearningPathGenerator` Protocol.** Services depend on
the Protocol. `api/dependencies.py` is the only place that knows a concrete provider
exists:

```python
def get_ai_provider(settings: Settings = Depends(get_settings)) -> LearningPathGenerator:
    if settings.ai_provider == "openai":
        return OpenAIProvider(settings)
    if settings.ai_provider == "gemini":
        return GeminiProvider(settings)
    return FakeProvider(settings)
```

Consequences the team should hold each other to:

1. **A new provider is one new file** in `infrastructure/ai/providers/`, one new branch
   in the factory, one env var. No service, router, or domain change. This is the
   concrete test of acceptance criterion 3.
2. **No provider SDK import above `infrastructure/`.** If a service file imports
   `openai`, that is a bug even if the code works.
3. **Every provider returns the same `GeneratedPath` type.** The parser (not the
   provider) is responsible for turning raw output into validated data, so provider
   quirks stay in `parser.py` rather than leaking into the domain.
4. **`FakeProvider` is the reference implementation.** It returns deterministic,
   schema-valid output and is used for unit tests, CI, and local development with no
   API key. Write the real providers to match its interface exactly.
5. **Structured output is requested, validated, and re-validated.** We ask the provider
   for JSON matching `schemas`/`GeneratedPath`; if validation fails we raise
   `AIProviderError` rather than persisting a half-formed path (#108).

---

## 8. Persistence

- **ORM:** SQLAlchemy 2.x async, `AsyncSession` per request, session lifecycle owned by
  `get_db` in `infrastructure/db/session.py`.
- **Migrations:** Alembic. Never `create_all` in production.
- **Transactions:** opened by the service, committed on success, rolled back on any
  exception. Services must not commit in the middle of a use case.
- **ORM models are not domain entities.** `repositories/` maps between them. This costs
  a little boilerplate and buys us freedom to reshape storage (#39) without touching
  business logic.
- **Auth is not special-cased.** Protected routers declare a dependency; the repository
  layer always scopes queries by `user_id`, so an un-scoped query is a review blocker.

Entity outlines (to be finalised in #39): `User`, `LearningPath` (1 user → N paths),
`Milestone` (1 path → N ordered milestones), `ProgressRecord` (user × milestone, with
`status` and `completed_at`).

---

## 9. Configuration

All configuration via environment variables, read in `core/config.py` (pydantic-settings).

| Variable | Purpose | Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL DSN | required |
| `AI_PROVIDER` | `openai` \| `gemini` \| `fake` | defaults to `fake` locally |
| `AI_API_KEY` | Provider credential | required when provider != `fake`; **never logged** |
| `AI_MODEL` | Model identifier | provider-specific default |
| `AI_TIMEOUT_SECONDS` | Generation timeout | bounded; drives #109 |
| `JWT_SECRET` | Token signing key | required outside dev; no insecure default |
| `CORS_ORIGINS` | Allowed frontend origins | list; no wildcard in production |
| `LOG_LEVEL` | Logging verbosity | defaults to `INFO` |

`.env.example` documents every variable with a placeholder. `.env` is gitignored. No
secret is ever committed; the CI security check (#113) will flag it.

---

## 10. Testing Strategy

Layered so that each test type stays fast and only one needs real infrastructure.

| Suite | Location | May touch | Needs |
| :--- | :--- | :--- | :--- |
| Unit | `tests/unit/` | `domain/`, `services/`, `parsers` | nothing external |
| Integration | `tests/integration/` | routers, repositories, real DB | Postgres container, `fake` provider |
| Contract | `tests/contract/` | full app | `fake` provider, schema snapshots |

Rules:

- **Unit tests construct services directly** with hand-written fakes implementing the
  Protocols. No FastAPI `TestClient`, no fixtures, no monkeypatching. If a unit test
  needs a database, the logic is in the wrong layer.
- **No network calls in CI.** The suite uses `FakeProvider`. Provider adapters get one
  opt-in smoke test marked `@pytest.mark.external`, run manually, never on PRs.
- **Integration tests use a real Postgres** (container), not SQLite, so migrations and
  Postgres-specific types are genuinely exercised.
- **Contract tests** assert responses against the #38 contract so a frontend change and
  a backend change cannot drift apart silently.
- **Every use case in `services/` has a unit test** covering the happy path, the
  business-rule violation, and the infrastructure-failure path.

This layout is what satisfies acceptance criterion 3 ("architecture supports testing").
It is also why `FakeProvider` is mandatory rather than a nice-to-have.

---

## 11. Key Decisions

| # | Decision | Rationale | Alternative rejected |
| :--- | :--- | :--- | :--- |
| D1 | Layered architecture, dependencies point inward | Smallest structure that still isolates I/O; learnable in a sprint | Full hexagonal/DDD — more ceremony than a 4-person team needs |
| D2 | Protocol-based `LearningPathGenerator` | Swaps providers without touching core logic (#22 AC3) | Provider SDK called directly in services — fast now, costly later |
| D3 | Domain entities separate from ORM models | Storage changes (#39) don't cascade into business logic | Using ORM rows as domain objects — fastest to start, most expensive later |
| D4 | `FakeProvider` ships as a first-class adapter | Unblocks parallel dev and makes tests free of network/cost | Hitting a real provider in dev — slow, flaky, and needs a shared key |
| D5 | One service method per use case, owns its transaction | Clear unit-of-work boundaries | Session-per-request managed in routers — leaks persistence into HTTP |
| D6 | Injected `AsyncSession` per request | Standard, no global state, test friendly | Global session — not safe under async concurrency |
| D7 | Separate request/response schemas | Keeps the API contract (#38) independently evolvable | One shared schema class — fewer files, coupled contract |
| D8 | Domain exception hierarchy mapped in one place | Consistent error envelope; no HTTP in the core | `HTTPException` raised from services — couples core to FastAPI |

---

## 12. Open Questions

To resolve in Sprint 3; owners to be assigned in the next stand-up.

1. **Monorepo layout.** The team's working assumption is a single repo with
   `backend/` and `frontend/` siblings (decision log item 5 is unvoted). This doc
   assumes `backend/`; the structure is unchanged if the backend becomes its own repo —
   only the path prefix moves.
2. **Auth strategy.** JWT bearer vs. session cookie, and whether registration is in
   MVP scope or seeded users are acceptable for the demo. Blocks #64.
3. **Sync vs. async services.** This doc assumes `async def` throughout. If we find
   ourselves awaiting purely-CPU work, we will document the rule for when *not* to
   use `async`.
4. **Rate limiting.** Whether #66 (User Dashboard) needs per-user quotas, and which library.
5. **Migration in CI.** Whether migrations run on every PR or only on `dev`/`main` merges.

---

## 13. Related Issues

| Issue | Relationship |
| :--- | :--- |
| #19 | Parent story — *Establish the application architecture* |
| #34 | *Setup FastAPI project* — realises the structure in §3 |
| #38 | *Define API contract* — consumes the schemas layer |
| #39 | *Design PostgreSQL schema* — realises the persistence section |
| #93 / #96 | *Select AI provider* / *Implement AI client* — plug into §7 |
| #95 | *Define structured AI response schema* — the `GeneratedPath` shape in §7.5 |
| #107–#109 | Provider error, timeout, malformed response — realise the error mapping |
| #21 / #23 / #25 | Frontend architecture, FE↔BE communication, provider integration |

---

## 14. Definition of Done for this Issue

- [x] Backend module structure is documented — §3
- [x] Responsibilities of routers / services / models are clear — §4, with import rules in §4.7
- [x] Architecture supports testing — §10
- [x] Architecture supports future provider changes — §7
- [ ] Reviewed and approved by the team (blocking before #34 starts)
- [ ] Recorded in the Team Decision Log
- [ ] Linked as a sub-issue of #19
