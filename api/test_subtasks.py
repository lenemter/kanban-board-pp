from fastapi.testclient import TestClient
import pytest

from main import app

client = TestClient(app)


@pytest.fixture
def test_task(client, auth_headers, test_column):
    task_data = {
        "title": "Test Task",
        "description": "Test Task Description",
        "position": 0,
        "column_id": test_column["id"]
    }
    response = client.post("/api/v1/tasks/", json=task_data, headers=auth_headers)
    return response.json()


def test_create_subtask(client, auth_headers, test_task):
    subtask_data = {
        "title": "Test Subtask",
        "is_completed": False,
        "task_id": test_task["id"]
    }
    response = client.post("/api/v1/subtasks/", json=subtask_data, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == subtask_data["title"]
    assert data["is_completed"] == subtask_data["is_completed"]
    assert data["task_id"] == test_task["id"]
    assert "id" in data


def test_get_subtask(client, auth_headers, test_task):
    # First create a subtask
    subtask_data = {
        "title": "Test Subtask",
        "is_completed": False,
        "task_id": test_task["id"]
    }
    response = client.post("/api/v1/subtasks/", json=subtask_data, headers=auth_headers)
    subtask_id = response.json()["id"]

    response = client.get(f"/api/v1/subtasks/{subtask_id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == subtask_id
    assert data["title"] == subtask_data["title"]


def test_update_subtask(client, auth_headers, test_task):
    # First create a subtask
    subtask_data = {
        "title": "Test Subtask",
        "is_completed": False,
        "task_id": test_task["id"]
    }
    response = client.post("/api/v1/subtasks/", json=subtask_data, headers=auth_headers)
    subtask_id = response.json()["id"]

    update_data = {
        "title": "Updated Subtask",
        "is_completed": True
    }
    response = client.put(f"/api/v1/subtasks/{subtask_id}", json=update_data, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["is_completed"] == update_data["is_completed"]


def test_delete_subtask(client, auth_headers, test_task):
    # First create a subtask
    subtask_data = {
        "title": "Test Subtask",
        "is_completed": False,
        "task_id": test_task["id"]
    }
    response = client.post("/api/v1/subtasks/", json=subtask_data, headers=auth_headers)
    subtask_id = response.json()["id"]

    response = client.delete(f"/api/v1/subtasks/{subtask_id}", headers=auth_headers)

    assert response.status_code == 200

    # Verify subtask is deleted
    response = client.get(f"/api/v1/subtasks/{subtask_id}", headers=auth_headers)
    assert response.status_code == 404


def test_list_task_subtasks(client, auth_headers, test_task):
    # Create multiple subtasks
    subtasks_data = [
        {"title": "Subtask 1", "is_completed": False, "task_id": test_task["id"]},
        {"title": "Subtask 2", "is_completed": True, "task_id": test_task["id"]},
        {"title": "Subtask 3", "is_completed": False, "task_id": test_task["id"]}
    ]

    for subtask_data in subtasks_data:
        client.post("/api/v1/subtasks/", json=subtask_data, headers=auth_headers)

    response = client.get(f"/api/v1/tasks/{test_task['id']}/subtasks", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3
    assert all(subtask["task_id"] == test_task["id"] for subtask in data)