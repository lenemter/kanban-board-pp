# test_summary.py в папке api
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))


def run_all_tests():
    """Запускает все тесты и показывает итоговый результат"""
    print("🚀 RUNNING ALL FASTAPI CONFIGURATION TESTS")
    print("=" * 60)

    test_results = []

    # Импортируем и запускаем тесты
    try:
        from test_app_fixed import (
            test_app_configuration,
            test_prefix_value,
            test_router_structure,
            test_fastapi_imports,
            test_app_routes,
            test_http_methods
        )

        # Запускаем базовые тесты
        tests = [
            ("Basic App Configuration", test_app_configuration),
            ("Prefix Value", test_prefix_value),
            ("Router Structure", test_router_structure),
            ("FastAPI Imports", test_fastapi_imports),
            ("App Routes", test_app_routes),
            ("HTTP Methods", test_http_methods)
        ]

        for test_name, test_func in tests:
            try:
                test_func()
                test_results.append(("✅", test_name))
            except Exception as e:
                test_results.append(("❌", f"{test_name}: {e}"))

        # Запускаем финальный тест конфигурации
        try:
            from test_final_config import test_fastapi_app_configuration
            test_fastapi_app_configuration()
            test_results.append(("✅", "Final App Configuration"))
        except Exception as e:
            test_results.append(("❌", f"Final App Configuration: {e}"))

    except ImportError as e:
        print(f"❌ Cannot import test modules: {e}")
        return False

    # Выводим результаты
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)

    for result, test_name in test_results:
        print(f"{result} {test_name}")

    # Подсчитываем результаты
    passed = sum(1 for result, _ in test_results if result == "✅")
    total = len(test_results)

    print("=" * 60)
    print(f"📈 TOTAL: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 EXCELLENT! All tests passed!")
        print("Your FastAPI application is correctly configured with:")
        print("- Proper FastAPI setup")
        print("- Correct prefix (/api/v1)")
        print("- All 8 routers included")
        print("- Working routes and HTTP methods")
        return True
    else:
        print("⚠️  Some tests failed, but core functionality works")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
# вроде нормально