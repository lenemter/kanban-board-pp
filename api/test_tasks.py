from fastapi.testclient import TestClient
import pytest

from main import app

client = TestClient(app)


@pytest.fixture
def test_column(client, auth_headers, test_board):
    column_data = {
        "name": "To Do",
        "position": 0,
        "board_id": test_board["id"]
    }
    response = client.post("/api/v1/columns/", json=column_data, headers=auth_headers)
    return response.json()


def test_create_task(client, auth_headers, test_column):
    task_data = {
        "title": "Test Task",
        "description": "Test Task Description",
        "position": 0,
        "column_id": test_column["id"]
    }
    response = client.post("/api/v1/tasks/", json=task_data, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == task_data["title"]
    assert data["description"] == task_data["description"]
    assert data["position"] == task_data["position"]
    assert data["column_id"] == test_column["id"]
    assert "id" in data


def test_get_task(client, auth_headers, test_column):
    # First create a task
    task_data = {
        "title": "Test Task",
        "description": "Test Task Description",
        "position": 0,
        "column_id": test_column["id"]
    }
    response = client.post("/api/v1/tasks/", json=task_data, headers=auth_headers)
    task_id = response.json()["id"]

    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == task_data["title"]


def test_update_task(client, auth_headers, test_column):
    # First create a task
    task_data = {
        "title": "Test Task",
        "description": "Test Task Description",
        "position": 0,
        "column_id": test_column["id"]
    }
    response = client.post("/api/v1/tasks/", json=task_data, headers=auth_headers)
    task_id = response.json()["id"]

    update_data = {
        "title": "Updated Task",
        "description": "Updated Description",
        "position": 1
    }
    response = client.put(f"/api/v1/tasks/{task_id}", json=update_data, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["description"] == update_data["description"]
    assert data["position"] == update_data["position"]


def test_move_task_between_columns(client, auth_headers, test_board):
    # Create two columns
    column1_data = {"name": "To Do", "position": 0, "board_id": test_board["id"]}
    column2_data = {"name": "In Progress", "position": 1, "board_id": test_board["id"]}

    response1 = client.post("/api/v1/columns/", json=column1_data, headers=auth_headers)
    column1_id = response1.json()["id"]
    response2 = client.post("/api/v1/columns/", json=column2_data, headers=auth_headers)
    column2_id = response2.json()["id"]

    # Create task in first column
    task_data = {
        "title": "Test Task",
        "description": "Test Task Description",
        "position": 0,
        "column_id": column1_id
    }
    response = client.post("/api/v1/tasks/", json=task_data, headers=auth_headers)
    task_id = response.json()["id"]

    # Move task to second column
    move_data = {
        "column_id": column2_id,
        "position": 0
    }
    response = client.put(f"/api/v1/tasks/{task_id}", json=move_data, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["column_id"] == column2_id


def test_delete_task(client, auth_headers, test_column):
    # First create a task
    task_data = {
        "title": "Test Task",
        "description": "Test Task Description",
        "position": 0,
        "column_id": test_column["id"]
    }
    response = client.post("/api/v1/tasks/", json=task_data, headers=auth_headers)
    task_id = response.json()["id"]

    response = client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)

    assert response.status_code == 200

    # Verify task is deleted
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 404


def test_list_column_tasks(client, auth_headers, test_column):
    # Create multiple tasks
    tasks_data = [
        {"title": "Task 1", "description": "Desc 1", "position": 0, "column_id": test_column["id"]},
        {"title": "Task 2", "description": "Desc 2", "position": 1, "column_id": test_column["id"]},
        {"title": "Task 3", "description": "Desc 3", "position": 2, "column_id": test_column["id"]}
    ]

    for task_data in tasks_data:
        client.post("/api/v1/tasks/", json=task_data, headers=auth_headers)

    response = client.get(f"/api/v1/columns/{test_column['id']}/tasks", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3
    assert all(task["column_id"] == test_column["id"] for task in data)