from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_get_user_profile(client, auth_headers, test_user):
    response = client.get(f"/api/v1/users/{test_user['id']}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user["id"]
    assert data["email"] == test_user["email"]
    assert data["name"] == test_user["name"]


def test_get_nonexistent_user(client, auth_headers):
    response = client.get("/api/v1/users/999", headers=auth_headers)

    assert response.status_code == 404


def test_update_user_profile(client, auth_headers, test_user):
    update_data = {
        "name": "Updated Name"
    }
    response = client.put(f"/api/v1/users/{test_user['id']}", json=update_data, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["email"] == test_user["email"]  # Email should not change


def test_update_other_user_profile(client, auth_headers):
    # Create another user
    other_user_data = {
        "name": "Other User",
        "email": "other@example.com",
        "password": "otherpassword123"
    }
    response = client.post("/api/v1/auth/register", json=other_user_data)
    other_user_id = response.json()["id"]

    # Try to update other user's profile
    update_data = {"name": "Hacked Name"}
    response = client.put(f"/api/v1/users/{other_user_id}", json=update_data, headers=auth_headers)

    assert response.status_code == 403