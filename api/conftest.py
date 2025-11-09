from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

def test_register_user(client):
    user_data = {
        "name": "New User",
        "email": "newuser@example.com",
        "password": "newpassword123"
    }
    response = client.post("/api/v1/auth/register", json=user_data)

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["name"] == user_data["name"]
    assert "id" in data
    assert "password" not in data


def test_register_duplicate_user(client, test_user):
    duplicate_user_data = {
        "name": "Duplicate User",
        "email": "test@example.com",  # Same email as test_user
        "password": "password123"
    }
    response = client.post("/api/v1/auth/register", json=duplicate_user_data)

    assert response.status_code == 400


def test_login_success(client, test_user):
    login_data = {
        "username": "test@example.com",
        "password": "testpassword123"
    }
    response = client.post("/api/v1/auth/token", data=login_data)

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_user):
    login_data = {
        "username": "test@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/token", data=login_data)

    assert response.status_code == 401


def test_login_nonexistent_user(client):
    login_data = {
        "username": "nonexistent@example.com",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/token", data=login_data)

    assert response.status_code == 401


def test_get_current_user(client, auth_headers):
    response = client.get("/api/v1/users/me", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert "id" in data


def test_get_current_user_unauthorized(client):
    response = client.get("/api/v1/users/me")

    assert response.status_code == 401