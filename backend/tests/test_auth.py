from fastapi import status


def test_user_registration_success(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Alice Developer",
            "email": "alice@example.com",
            "password": "Password123!"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Alice Developer"
    assert data["email"] == "alice@example.com"
    assert "id" in data
    assert "password" not in data  # Never expose password hash


def test_user_registration_duplicate_email(client, user_a):
    response = client.post(
        "/auth/register",
        json={
            "name": "Duplicate User",
            "email": user_a.email,
            "password": "Password123!"
        }
    )
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in response.json()["detail"].lower()


def test_user_registration_invalid_password(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Short Pass User",
            "email": "short@example.com",
            "password": "short"  # Less than 8 characters
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_user_registration_invalid_email(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Bad Email User",
            "email": "not-an-email",
            "password": "Password123!"
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_login_success(client, user_a):
    response = client.post(
        "/auth/login",
        data={
            "username": user_a.email,
            "password": "password123"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"].lower() == "bearer"


def test_login_invalid_password(client, user_a):
    response = client.post(
        "/auth/login",
        data={
            "username": user_a.email,
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "invalid email or password" in response.json()["detail"].lower()


def test_login_nonexistent_user(client):
    response = client.post(
        "/auth/login",
        data={
            "username": "nobody@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user_me(client, headers_a, user_a):
    response = client.get("/auth/me", headers=headers_a)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == user_a.id
    assert data["email"] == user_a.email
    assert "password" not in data


def test_get_current_user_unauthorized(client):
    response = client.get("/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_current_user_invalid_token(client):
    response = client.get("/auth/me", headers={"Authorization": "Bearer invalidtoken123"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_logout(client):
    response = client.post("/auth/logout")
    assert response.status_code == status.HTTP_200_OK
    assert "logged out" in response.json()["message"].lower()
