from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_activities():
    res = client.get("/activities")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    # check one known activity exists
    assert "Chess Club" in data


def test_signup_and_unregister_flow():
    activity = "Basketball Team"
    email = "tester@example.com"

    # ensure not present
    res = client.get("/activities")
    assert res.status_code == 200
    assert email not in res.json()[activity]["participants"]

    # signup
    res = client.post(f"/activities/{activity}/signup?email={email}")
    assert res.status_code == 200
    body = res.json()
    assert "Signed up" in body.get("message", "")

    # now participant should be present
    res = client.get("/activities")
    assert email in res.json()[activity]["participants"]

    # unregister
    res = client.delete(f"/activities/{activity}/signup?email={email}")
    assert res.status_code == 200
    body = res.json()
    assert "Unregistered" in body.get("message", "")

    # verify removed
    res = client.get("/activities")
    assert email not in res.json()[activity]["participants"]


def test_signup_duplicate_returns_400():
    activity = "Chess Club"
    # michael is already in seed data
    email = "michael@mergington.edu"
    res = client.post(f"/activities/{activity}/signup?email={email}")
    assert res.status_code == 400


def test_unregister_nonexistent_returns_404():
    activity = "Programming Class"
    email = "not-registered@example.com"
    res = client.delete(f"/activities/{activity}/signup?email={email}")
    assert res.status_code == 404


def test_activity_not_found():
    res = client.post("/activities/NoSuchActivity/signup?email=a@b.com")
    assert res.status_code == 404
    res = client.delete("/activities/NoSuchActivity/signup?email=a@b.com")
    assert res.status_code == 404
