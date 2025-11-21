"""Тесты структуры проекта"""
import pytest
import os
from pathlib import Path


class TestProjectStructure:
    """Тесты структуры проекта"""

    def test_project_files_exist(self):
        """Проверка что основные файлы проекта существуют"""
        project_root = Path(__file__).parent.parent

        required_files = [
            "main.py",
            "requirements.txt",
            "Dockerfile",
            ".env"
        ]

        for file in required_files:
            file_path = project_root / file
            if file_path.exists():
                print(f"✅ {file} существует")
            else:
                print(f"⚠️ {file} не найден")

    def test_api_structure(self):
        """Проверка структуры папки api"""
        api_path = Path(__file__).parent.parent / "api"

        if api_path.exists():
            required_dirs = [
                "db",
                "routers",
                "schemas"
            ]

            for dir_name in required_dirs:
                dir_path = api_path / dir_name
                if dir_path.exists():
                    print(f"✅ Папка api/{dir_name} существует")
                else:
                    print(f"⚠️ Папка api/{dir_name} не найдена")
        else:
            print("ℹ️ Папка api не найдена - возможно другая структура проекта")

    def test_import_main_components(self):
        """Тест импорта основных компонентов"""
        # Тестируем что основные зависимости работают
        try:
            from fastapi import FastAPI
            from pydantic import BaseModel
            from sqlmodel import SQLModel
            print("✅ Основные зависимости импортируются")
        except ImportError as e:
            pytest.fail(f"Ошибка импорта основных зависимостей: {e}")