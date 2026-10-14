from fastapi.testclient import TestClient

from app.main import create_app


def test_docs_are_reachable() -> None:
    client = TestClient(create_app())
    assert client.get("/docs").status_code == 200


def test_openapi_schema_is_served() -> None:
    client = TestClient(create_app())
    schema = client.get("/openapi.json").json()
    assert schema["info"]["title"] == "Path Generator API"
