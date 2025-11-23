# conftest.py в папке api
import pytest
import sys
import os

# Настраиваем пути импорта
sys.path.insert(0, os.path.dirname(__file__))


@pytest.fixture
def app():
    """Фикстура для создания тестового приложения"""
    from fastapi import FastAPI
    from routers import (
        auth_router, users_router, boards_router, tags_router,
        columns_router, tasks_router, task_comments_router, subtasks_router
    )
    from utils import PREFIX

    app = FastAPI()
    app.include_router(auth_router, prefix=PREFIX)
    app.include_router(users_router, prefix=PREFIX)
    app.include_router(boards_router, prefix=PREFIX)
    app.include_router(tags_router, prefix=PREFIX)
    app.include_router(columns_router, prefix=PREFIX)
    app.include_router(tasks_router, prefix=PREFIX)
    app.include_router(task_comments_router, prefix=PREFIX)
    app.include_router(subtasks_router, prefix=PREFIX)

    return app


@pytest.fixture
def client(app):
    """Фикстура для тестового клиента"""
    from fastapi.testclient import TestClient
    return TestClient(app)