"""Application entry point for the Path Generator API."""

from fastapi import FastAPI


def create_app() -> FastAPI:
    """Build the FastAPI application.

    This is the composition root: routers, middleware and dependency wiring are
    registered here as later issues land (#36 CORS, #37 health, #97 routes).
    """
    return FastAPI(
        title="Path Generator API",
        description="Learning path generation service for Voyage 62 Tier 3 Team 33.",
        version="0.1.0",
    )


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
