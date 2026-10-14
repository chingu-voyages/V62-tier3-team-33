# Backend

FastAPI service for the learning path generator. Structure and layer rules come from
[Backend Architecture](../docs/backend-architecture.md) (#22); this issue (#34) only
bootstraps the project.

## Requirements

- Python 3.11 or newer
- `pip` and a virtual environment

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
```

`.venv/`, `__pycache__/` and `.env` are already covered by the root `.gitignore`.

## Run

```bash
uvicorn app.main:app --reload     # or: python -m app.main
```

- API docs (Swagger UI): http://127.0.0.1:8000/docs
- OpenAPI schema: http://127.0.0.1:8000/openapi.json

## Test and lint

```bash
pytest -q
ruff check .
```

The smoke tests in `tests/integration/` assert that the app starts and serves its
docs — acceptance criteria 1 and 2 of #34.

## Dependencies

| Package | Why | Version range |
| :--- | :--- | :--- |
| `fastapi` | HTTP framework, automatic `/docs` and OpenAPI | `>=0.115,<1.0` |
| `uvicorn[standard]` | ASGI server that runs the app locally and in deployment | `>=0.30,<1.0` |
| `pydantic` | Request/response validation and the domain value types | `>=2.7,<3.0` |
| `pydantic-settings` | Environment-backed settings in `core/config.py` (#35) | `>=2.2,<3.0` |
| `pytest` (dev) | Test runner | `>=8.0,<9.0` |
| `ruff` (dev) | Linting | `>=0.6,<1.0` |
| `httpx2` (dev) | HTTP transport for FastAPI's `TestClient` | `>=2.0,<3.0` |

All ranges are declared in `pyproject.toml`; installs are reproducible from that file
alone. Later issues add `sqlalchemy` + `alembic` (#39, #143–#146) and the AI client
SDK (#96) when those layers are built.

## Structure

```
backend/
├── pyproject.toml              # dependencies, pytest and ruff config (#34)
├── app/
│   ├── main.py                 # ASGI entry point, create_app() composition root (#34)
│   ├── core/                   # settings, logging, errors, security (#35)
│   ├── domain/                 # entities and Protocols — pure Python (#141+)
│   ├── schemas/                # Pydantic request/response models (#38, #95)
│   ├── services/               # business logic per use case (#97)
│   ├── api/
│   │   └── routers/            # HTTP routes; CORS in #36, health in #37
│   └── infrastructure/
│       ├── db/                 # engine, session, ORM models (#143–#144)
│       ├── repositories/       # implementations of the domain Protocols
│       ├── ai/
│       │   └── providers/      # gemini/groq/fake adapters (#93, #96)
│       └── auth/               # token and password helpers (#214+)
└── tests/
    ├── unit/                   # no I/O, no network
    ├── integration/            # app-level tests (smoke test now, DB later)
    └── contract/               # API contract assertions (#38)
```

Package boundaries are the architecture's import rules: `domain/` and `services/`
never import FastAPI, SQLAlchemy, or a provider SDK (§4.7 of the architecture doc).

## Not in this issue

Environment variables (#35), CORS (#36), and the health endpoint (#37) are separate
tasks — the app intentionally starts with no configuration and no routes.
