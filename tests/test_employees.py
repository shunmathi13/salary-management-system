
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_employee_count():
    response = client.get("/employees/count")

    assert response.status_code == 200
    assert response.json()["total_employees"] >= 10000


def test_employee_crud_workflow():
    employee_id = "TEST-AUTOMATED-001"

    # Remove a leftover record from an earlier test run, if any.
    client.delete(f"/employees/{employee_id}")

    # Create employee
    response = client.post(
        "/employees",
        json={
            "employee_id": employee_id,
            "name": "Automated Test Employee",
            "country": "India",
            "department": "Engineering",
            "salary": 50000,
            "currency": "INR",
        },
    )
    assert response.status_code == 201
    assert response.json()["employee_id"] == employee_id

    # Read employee
    response = client.get(f"/employees/{employee_id}")
    assert response.status_code == 200
    assert response.json()["salary"] == 50000

    # Update employee
    response = client.put(
        f"/employees/{employee_id}",
        json={"salary": 65000, "department": "Research"},
    )
    assert response.status_code == 200
    assert response.json()["salary"] == 65000
    assert response.json()["department"] == "Research"

    # Delete employee
    response = client.delete(f"/employees/{employee_id}")
    assert response.status_code == 204

    # Verify employee no longer exists
    response = client.get(f"/employees/{employee_id}")
    assert response.status_code == 404


def test_duplicate_employee_id_is_rejected():
    employee_id = "TEST-DUPLICATE-001"

    # Ensure a clean starting state.
    client.delete(f"/employees/{employee_id}")

    payload = {
        "employee_id": employee_id,
        "name": "Duplicate Test Employee",
        "country": "India",
        "department": "Finance",
        "salary": 40000,
        "currency": "INR",
    }

    try:
        first = client.post("/employees", json=payload)
        assert first.status_code == 201

        second = client.post("/employees", json=payload)
        assert second.status_code == 409
    finally:
        client.delete(f"/employees/{employee_id}")
