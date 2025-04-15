# EduCollab System API Documentation

Base URL: `http//localhost:5000`

## Authentication API

This section documents the authentication endpoints for the EduCollab System.

### Default admin account

Username: `admin_educollab2025`
Password: `eduAdmin2025`

### Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Creates a new user account in the system.

**Authentication Required:** No

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "full_name": "string",
  "phone_number": "string",
  "gender": "string",
  "role": "string"
}
```

**Validation Rules:**
- All fields are required
- Email must be in a valid format
- Password must be at least 8 characters long

**Response:**
```json
{
  "success": true,
  "message": "Registered successfully",
  "user": {
    "username": "string",
    "email": "string",
    "full_name": "string",
    "gender": "string",
    "role": "string"
  }
}
```

**Status Codes:**
- `201 Created`: User successfully registered
- `400 Bad Request`: Invalid input data
- `500 Internal Server Error`: Server error

### Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates a user and returns a JWT token.

**Authentication Required:** No

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Validation Rules:**
- Username and password are required

**Response:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "user": {
    "user_id": "number",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "gender": "string",
    "role": "string",
    "token": "string"
  }
}
```

**Status Codes:**
- `200 OK`: User successfully logged in
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

### Refresh Token

**Endpoint:** `POST /api/refresh-token`

**Description:** Refreshes an existing JWT token.

**Authentication Required:** Yes (Bearer Token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "string"
}
```

**Status Codes:**
- `200 OK`: Token successfully refreshed
- `400 Bad Request`: No token provided
- `401 Unauthorized`: Invalid token
- `500 Internal Server Error`: Server error

## Authentication Middleware

### Bearer Token Authentication

The API uses JWT (JSON Web Token) for authentication. For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

**Error Responses:**
- `401 Unauthorized`: Authentication required or invalid token
- `404 Not Found`: User not found

### Optional Authentication

Some endpoints support optional authentication, where the user can be authenticated but it's not required. The API will use the user's identity if a valid token is provided, but will still work without authentication.

### Admin Authentication

Certain endpoints require admin privileges. These endpoints will check if the authenticated user has the "admin" role.

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Admin access required