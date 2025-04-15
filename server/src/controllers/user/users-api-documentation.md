# Users Documentation

This document provides detailed information about the user API endpoints in the EduCollab System.

## Endpoints

### 1. Get All Users

**Description:** Retrieves a list of all users in the system.

**Endpoint:** `GET /users`

**Controller Function:** `getAllUsers`

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

**Description:** Retrieves a specific user's profile information.

**Endpoint:** `GET /profile/:user_id`

**Controller Function:** `getUserProfile`

**Parameters:**
- `user_id` (URL parameter): The ID of the user to retrieve

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

**Description:** Updates a user's profile information.

**Endpoint:** `PUT /profile/:user_id`

**Controller Function:** `updateUserProfile`

**Parameters:**
- `user_id` (URL parameter): The ID of the user to update
- Request Body: JSON object containing user data to update

**Request Body Example:**
```json
{
  "username": "johndoe_updated",
  "email": "john.updated@example.com",
  "full_name": "John Updated Doe",
  "phone_number": "9876543210",
  "gender": "male",
  "role": "student"
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

**Description:** Updates a user's password.

**Endpoint:** `PUT /user/:user_id/password`

**Controller Function:** `updateUserPassword`

**Parameters:**
- `user_id` (URL parameter): The ID of the user whose password to update
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

### 5. Delete User

**Description:** Deletes a user from the system.

**Endpoint:** `DELETE /user/:user_id`

**Controller Function:** `deleteUser`

**Parameters:**
- `user_id` (URL parameter): The ID of the user to delete

**Response:**
```json
{
  "success": true,
  "message": "Delete user successfully"
}
```

**Status Code:** 200 OK

## Error Handling

All endpoints return appropriate error responses with descriptive messages when operations fail. Common error status codes include:

- 400 Bad Request: Invalid input data
- 401 Unauthorized: Authentication required
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server-side error

## Dependencies

These controller functions rely on the following services:
- `getAllUsersService`
- `getUserProfileService`
- `updateUserService`
- `updateUserPasswordService`
- `deleteUserService`