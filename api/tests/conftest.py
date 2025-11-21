import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI


@pytest.fixture(scope="session")
def app():
    """Простое тестовое приложение без импорта основного приложения"""
    app = FastAPI(title="Test API")

    # Базовые тестовые эндпоинты
    @app.get("/test")
    def test_get():
        return {"message": "GET test"}

    @app.post("/test")
    def test_post():
        return {"message": "POST test"}

    @app.get("/health")
    def health():
        return {"status": "healthy"}

    return app


@pytest.fixture(scope="session")
def client(app):
    """Тестовый клиент"""
    with TestClient(app) as client:
        yield client