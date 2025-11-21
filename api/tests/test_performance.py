"""Тесты производительности API"""
import pytest
import time
from fastapi import FastAPI
from fastapi.testclient import TestClient


class TestAPIPerformance:
    """Тесты производительности API"""

    def test_response_time(self):
        """Тест времени ответа API"""
        app = FastAPI()

        @app.get("/fast-endpoint")
        def fast_endpoint():
            return {"message": "fast"}

        @app.get("/slow-endpoint")
        def slow_endpoint():
            time.sleep(0.1)  # Имитация медленного endpoint
            return {"message": "slow"}

        client = TestClient(app)

        # Тестируем быстрый endpoint
        start_time = time.time()
        response = client.get("/fast-endpoint")
        fast_time = time.time() - start_time

        assert response.status_code == 200
        assert fast_time < 0.1  # Должен быть быстрым
        print(f"✅ Быстрый endpoint: {fast_time:.3f} секунд")

        # Тестируем медленный endpoint
        start_time = time.time()
        response = client.get("/slow-endpoint")
        slow_time = time.time() - start_time

        assert response.status_code == 200
        assert slow_time >= 0.1  # Должен быть медленным
        print(f"✅ Медленный endpoint: {slow_time:.3f} секунд")

    def test_multiple_requests(self):
        """Тест множественных запросов"""
        app = FastAPI()

        @app.get("/counter")
        def counter():
            return {"count": "ok"}

        client = TestClient(app)

        # Делаем несколько запросов подряд
        for i in range(5):
            response = client.get("/counter")
            assert response.status_code == 200
            assert response.json() == {"count": "ok"}

        print("✅ 5 последовательных запросов выполнены успешно")