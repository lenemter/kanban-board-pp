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


def test_create_task_comment(client, auth_headers, test_task):
    comment_data = {
        "content": "This is a test comment",
        "task_id": test_task["id"]
    }
    response = client.post("/api/v1/task_comments/", json=comment_data, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["content"] == comment_data["content"]
    assert data["task_id"] == test_task["id"]
    assert "id" in data
    assert "author_id" in data


def test_get_task_comment(client, auth_headers, test_task):
    # First create a comment
    comment_data = {
        "content": "This is a test comment",
        "task_id": test_task["id"]
    }
    response = client.post("/api/v1/task_comments/", json=comment_data, headers=auth_headers)
    comment_id = response.json()["id"]

    response = client.get(f"/api/v1/task_comments/{comment_id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == comment_id
    assert data["content"] == comment_data["content"]


def test_update_task_comment(client, auth_headers, test_task):
    # First create a comment
    comment_data = {
        "content": "This is a test comment",
        "task_id": test_task["id"]
    }
    response = client.post("/api/v1/task_comments/", json=comment_data, headers=auth_headers)
    comment_id = response.json()["id"]

    update_data = {
        "content": "Updated comment content"
    }
    response = client.put(f"/api/v1/task_comments/{comment_id}", json=update_data, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["content"] == update_data["content"]


def test_delete_task_comment(client, auth_headers, test_task):
    # First create a comment
    comment_data = {
        "content": "This is a test comment",
        "task_id": test_task["id"]
    }
    response = client.post("/api/v1/task_comments/", json=comment_data, headers=auth_headers)
    comment_id = response.json()["id"]

    response = client.delete(f"/api/v1/task_comments/{comment_id}", headers=auth_headers)

    assert response.status_code == 200

    # Verify comment is deleted
    response = client.get(f"/api/v1/task_comments/{comment_id}", headers=auth_headers)
    assert response.status_code == 404


def test_list_task_comments(client, auth_headers, test_task):
    # Create multiple comments
    comments_data = [
        {"content": "Comment 1", "task_id": test_task["id"]},
        {"content": "Comment 2", "task_id": test_task["id"]},
        {"content": "Comment 3", "task_id": test_task["id"]}
    ]

    for comment_data in comments_data:
        client.post("/api/v1/task_comments/", json=comment_data, headers=auth_headers)

    response = client.get(f"/api/v1/tasks/{test_task['id']}/comments", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3
    assert all(comment["task_id"] == test_task["id"] for comment in data)