from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_create_column(client, auth_headers, test_board):
    column_data = {
        "name": "To Do",
        "position": 0,
        "board_id": test_board["id"]
    }
    response = client.post("/api/v1/columns/", json=column_data, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == column_data["name"]
    assert data["position"] == column_data["position"]
    assert data["board_id"] == test_board["id"]
    assert "id" in data


def test_create_column_unauthorized_access(client, test_board):
    column_data = {
        "name": "To Do",
        "position": 0,
        "board_id": test_board["id"]
    }
    response = client.post("/api/v1/columns/", json=column_data)

    assert response.status_code == 401


def test_get_column(client, auth_headers, test_board):
    # First create a column
    column_data = {
        "name": "To Do",
        "position": 0,
        "board_id": test_board["id"]
    }
    response = client.post("/api/v1/columns/", json=column_data, headers=auth_headers)
    column_id = response.json()["id"]

    response = client.get(f"/api/v1/columns/{column_id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == column_id
    assert data["name"] == column_data["name"]


def test_update_column(client, auth_headers, test_board):
    # First create a column
    column_data = {
        "name": "To Do",
        "position": 0,
        "board_id": test_board["id"]
    }
    response = client.post("/api/v1/columns/", json=column_data, headers=auth_headers)
    column_id = response.json()["id"]

    update_data = {
        "name": "In Progress",
        "position": 1
    }
    response = client.put(f"/api/v1/columns/{column_id}", json=update_data, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["position"] == update_data["position"]


def test_delete_column(client, auth_headers, test_board):
    # First create a column
    column_data = {
        "name": "To Do",
        "position": 0,
        "board_id": test_board["id"]
    }
    response = client.post("/api/v1/columns/", json=column_data, headers=auth_headers)
    column_id = response.json()["id"]

    response = client.delete(f"/api/v1/columns/{column_id}", headers=auth_headers)

    assert response.status_code == 200

    # Verify column is deleted
    response = client.get(f"/api/v1/columns/{column_id}", headers=auth_headers)
    assert response.status_code == 404


def test_list_board_columns(client, auth_headers, test_board):
    # Create multiple columns
    columns_data = [
        {"name": "To Do", "position": 0, "board_id": test_board["id"]},
        {"name": "In Progress", "position": 1, "board_id": test_board["id"]},
        {"name": "Done", "position": 2, "board_id": test_board["id"]}
    ]

    for column_data in columns_data:
        client.post("/api/v1/columns/", json=column_data, headers=auth_headers)

    response = client.get(f"/api/v1/boards/{test_board['id']}/columns", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3
    assert all(column["board_id"] == test_board["id"] for column in data)