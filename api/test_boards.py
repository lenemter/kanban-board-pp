from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_create_board(client, auth_headers):
    board_data = {
        "name": "New Board",
        "description": "New Board Description",
        "is_public": False
    }
    response = client.post("/api/v1/boards/", json=board_data, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == board_data["name"]
    assert data["description"] == board_data["description"]
    assert data["is_public"] == board_data["is_public"]
    assert "id" in data
    assert "owner_id" in data


def test_create_board_unauthorized(client):
    board_data = {
        "name": "New Board",
        "description": "New Board Description",
        "is_public": False
    }
    response = client.post("/api/v1/boards/", json=board_data)

    assert response.status_code == 401


def test_get_board(client, auth_headers, test_board):
    response = client.get(f"/api/v1/boards/{test_board['id']}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_board["id"]
    assert data["name"] == test_board["name"]


def test_get_nonexistent_board(client, auth_headers):
    response = client.get("/api/v1/boards/999", headers=auth_headers)

    assert response.status_code == 404


def test_get_private_board_unauthorized(client, test_board):
    # First, make the board private
    update_data = {"is_public": False}
    client.put(f"/api/v1/boards/{test_board['id']}", json=update_data, headers=auth_headers)

    # Try to access without auth
    response = client.get(f"/api/v1/boards/{test_board['id']}")

    assert response.status_code == 401


def test_update_board(client, auth_headers, test_board):
    update_data = {
        "name": "Updated Board Name",
        "description": "Updated Description",
        "is_public": False
    }
    response = client.put(f"/api/v1/boards/{test_board['id']}", json=update_data, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]
    assert data["is_public"] == update_data["is_public"]


def test_update_other_users_board(client, auth_headers):
    # Create another user and board
    other_user_data = {
        "name": "Other User",
        "email": "other@example.com",
        "password": "otherpassword123"
    }
    response = client.post("/api/v1/auth/register", json=other_user_data)

    # Login as other user and create board
    login_data = {
        "username": "other@example.com",
        "password": "otherpassword123"
    }
    response = client.post("/api/v1/auth/token", data=login_data)
    other_auth_headers = {"Authorization": f"Bearer {response.json()['access_token']}"}

    board_data = {
        "name": "Other User Board",
        "description": "Other User Board Description",
        "is_public": True
    }
    response = client.post("/api/v1/boards/", json=board_data, headers=other_auth_headers)
    other_board_id = response.json()["id"]

    # Try to update other user's board
    update_data = {"name": "Hacked Board"}
    response = client.put(f"/api/v1/boards/{other_board_id}", json=update_data, headers=auth_headers)

    assert response.status_code == 403


def test_delete_board(client, auth_headers, test_board):
    response = client.delete(f"/api/v1/boards/{test_board['id']}", headers=auth_headers)

    assert response.status_code == 200

    # Verify board is deleted
    response = client.get(f"/api/v1/boards/{test_board['id']}", headers=auth_headers)
    assert response.status_code == 404


def test_list_user_boards(client, auth_headers, test_board):
    response = client.get("/api/v1/boards/", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(board["id"] == test_board["id"] for board in data)