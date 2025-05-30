# Users Documentation

This document provides detailed information about the user API endpoints in the EduCollab System.

Base URL: `http://localhost:5000`

## Endpoints

### 1. Get All Users

**Description:** Retrieves a list of all users in the system.

**Endpoint:** `GET /api/users`

**Controller Function:** `getAllUsers`

**Authentication Required:** Yes (Admin only)

**Parameters:** None

**Response:**

```json
{
  "success": true,
  "message": "Get all users successfully",
  "users": [
    {
      "user_id": 1,
      "username": "johndoe",
      "email": "john.doe@example.com",
      "full_name": "John Doe",
      "phone_number": "1234567890",
      "gender": "male",
      "role": "student"
    },
    {
      "user_id": 2,
      "username": "janedoe",
      "email": "jane.doe@example.com",
      "full_name": "Jane Doe",
      "phone_number": "0987654321",
      "gender": "female",
      "role": "teacher"
    }
  ]
}
```

**Status Code:** 200 OK

---

### 2. Get User Profile

**Description:** Retrieves the authenticated user's profile information.

**Endpoint:** `GET /api/profile`

**Controller Function:** `getUserProfile`

**Authentication Required:** Yes (Bearer Token)

**Parameters:** None

**Response:**

```json
{
  "success": true,
  "message": "Get profile successfully",
  "user": {
    "user_id": 1,
    "username": "johndoe",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "phone_number": "1234567890",
    "gender": "male",
    "role": "student"
  }
}
```

**Status Code:** 200 OK

---

### 3. Update User Profile

**Description:** Updates the authenticated user's profile information.

**Endpoint:** `PUT /api/profile`

**Controller Function:** `updateUserProfile`

**Authentication Required:** Yes (Bearer Token)

**Parameters:**

- Request Body: JSON object containing user data to update

**Request Body Example:**

```json
{
  "username": "johndoe_updated",
  "email": "john.updated@example.com",
  "full_name": "John Updated Doe",
  "phone_number": "9876543210",
  "gender": "male"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Update profile successfully",
  "user": {
    "user_id": 1,
    "username": "johndoe_updated",
    "email": "john.updated@example.com",
    "full_name": "John Updated Doe",
    "phone_number": "9876543210",
    "gender": "male",
    "role": "student"
  }
}
```

**Status Code:** 201 Created

---

### 4. Update User Password

**Description:** Updates the authenticated user's password.

**Endpoint:** `PUT /api/user/change-password`

**Controller Function:** `updateUserPassword`

**Authentication Required:** Yes (Bearer Token)

**Parameters:**

- Request Body:

```json
{
  "oldPassword": "current-password",
  "newPassword": "new-password"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Update password successfully",
  "newPassword": "new-password"
}
```

**Status Code:** 201 Created

---

### 5. Deactivate User

**Description:** Deactivates a user account in the system.

**Endpoint:** `PUT /api/user/deactivate/:user_id`

**Controller Function:** `deactivateUser`

**Authentication Required:** Yes (Admin only)

**Parameters:**

- `user_id` (URL parameter): The ID of the user to deactivate

**Response:**

```json
{
  "success": true,
  "message": "Deactivate user successfully"
}
```

**Status Code:** 201 Created

### 6. Activate User

**Description:** Activates a previously deactivated user account.

**Endpoint:** `PUT /api/user/activate/:user_id`

**Controller Function:** `activateUser`

**Authentication Required:** Yes (Admin only)

**Parameters:**

- `user_id` (URL parameter): The ID of the user to activate

**Response:**

```json
{
  "success": true,
  "message": "Activate user successfully"
}
```

**Status Code:** 201 Created

## Error Handling

All endpoints return appropriate error responses with descriptive messages when operations fail. Common error status codes include:

- 400 Bad Request: Invalid input data
- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient permissions (non-admin user)
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server-side error

## Dependencies

These controller functions rely on the following services:

- `getAllUsersService`
- `getUserProfileService`
- `updateUserService`
- `updateUserPasswordService`
- `deleteUserService`
