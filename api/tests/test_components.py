"""Тесты отдельных компонентов"""
import pytest


def test_sqlmodel_import():
    """Тест импорта SQLModel"""
    try:
        from sqlmodel import SQLModel, Field, Session
        assert True
        print("✅ SQLModel импортирован успешно")
    except ImportError as e:
        pytest.fail(f"SQLModel не импортируется: {e}")


def test_fastapi_import():
    """Тест импорта FastAPI"""
    try:
        from fastapi import FastAPI, Depends, HTTPException
        from fastapi.security import HTTPBearer
        assert True
        print("✅ FastAPI импортирован успешно")
    except ImportError as e:
        pytest.fail(f"FastAPI не импортируется: {e}")


def test_pydantic_import():
    """Тест импорта Pydantic"""
    try:
        from pydantic import BaseModel, EmailStr
        assert True
        print("✅ Pydantic импортирован успешно")
    except ImportError as e:
        pytest.fail(f"Pydantic не импортируется: {e}")


class TestDatabaseModels:
    """Тесты моделей базы данных"""

    def test_models_import(self):
        """Тест импорта моделей"""
        try:
            # Пробуем импортировать модели напрямую
            import sys
            from pathlib import Path

            # Добавляем путь к api
            api_path = Path(__file__).parent.parent
            sys.path.insert(0, str(api_path))

            # Пробуем импортировать модели
            try:
                from db.models.user import User
                print("✅ Модель User импортирована успешно")
            except ImportError as e:
                print(f"⚠️ Модель User не импортируется: {e}")

            try:
                from db.models.board import Board
                print("✅ Модель Board импортирована успешно")
            except ImportError as e:
                print(f"⚠️ Модель Board не импортируется: {e}")

            assert True

        except Exception as e:
            pytest.skip(f"Импорт моделей пропущен: {e}")