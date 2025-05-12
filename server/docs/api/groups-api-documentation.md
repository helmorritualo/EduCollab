# Groups API Documentation

This document provides detailed information about the group management API endpoints in the EduCollab System.

Base URL: `http://localhost:5000`

## Authentication

All endpoints require authentication using a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Authorization

- Regular users can create and manage their own groups
- Admin users can manage all groups
- Users can only update and delete groups they created (except admins who can manage all groups)

## Endpoints

### 1. Get All Groups

**Description:** Retrieves a list of all groups in the system.

**Endpoint:** `GET /api/groups`

**Controller Function:** `getAllGroups`

**Authentication Required:** Yes (Bearer Token)

**Response:**

```json
{
  "success": true,
  "message": "Groups retrieved successfully",
  "groups": [
    {
      "group_id": 1,
      "name": "New Study Groups",
      "description": "A new group for collaborative study",
      "created_by": 2,
      "group_code": "rfWBpzvw",
      "created_at": "2025-05-05T10:36:32.000Z",
      "creator_name": "John Doe"
    },
    {
      "group_id": 2,
      "name": "Study group for java project",
      "description": "A new group for collaborating of java project",
      "created_by": 2,
      "group_code": "vJIstKFy",
      "created_at": "2025-05-05T10:39:48.000Z",
      "creator_name": "John Doe"
    },
    {
      "group_id": 3,
      "name": "Study group for WEB SYS project",
      "description": "A new group for collaborating of FULL STACK project",
      "created_by": 2,
      "group_code": "HrwWp2sx",
      "created_at": "2025-05-05T10:51:41.000Z",
      "creator_name": "John Doe"
    }
  ]
}
```

**Status Code:** 200 OK

---

### 2. Get Group By ID

**Description:** Retrieves a specific group by its ID.

**Endpoint:** `GET /api/groups/:group_id`

**Controller Function:** `getGroupById`

**Authentication Required:** Yes (Bearer Token)

**Parameters:**

- `group_id` (URL parameter): The ID of the group to retrieve

**Response:**

```json
{
  "success": true,
  "message": "Group retrieved successfully",
  "group": {
    "group_id": 1,
    "name": "New Study Groups",
    "description": "A new group for collaborative study",
    "created_by": 2,
    "group_code": "rfWBpzvw",
    "created_at": "2025-05-05T10:36:32.000Z",
    "creator_name": "John Doe"
  }
}
```

**Status Code:** 200 OK

---

### 3. Create Group

**Description:** Creates a new group in the system.

**Endpoint:** `POST /api/groups`

**Controller Function:** `createGroup`

**Authentication Required:** Yes (Bearer Token)

**Request Body:**

```json
{
  "name": "New Study Group",
  "description": "A new group for collaborative study"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Group created successfully",
  "group": {
    "group_id": 3,
    "name": "Study group for WEB SYS project",
    "description": "A new group for collaborating of FULL STACK project",
    "created_by": 2,
    "group_code": "HrwWp2sx",
    "created_at": "2025-05-05T10:51:41.000Z",
    "creator_name": "John Doe"
  }
}
```

**Status Code:** 201 Created

---

### 4. Update Group

**Description:** Updates an existing group's information.

**Endpoint:** `PUT /api/groups/:group_id`

**Controller Function:** `updateGroup`

**Authentication Required:** Yes (Bearer Token)

**Authorization:** Only the group creator or an admin can update a group

**Parameters:**

- `group_id` (URL parameter): The ID of the group to update

**Request Body:**

```json
{
  "name": "Updated Study Group",
  "description": "Updated description for the study group"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Group updated successfully",
  "group": {
    "group_id": 3,
    "name": "Updated Study Group",
    "description": "Updated description for the study group",
    "created_by": 2,
    "group_code": "HrwWp2sx",
    "created_at": "2025-05-05T10:51:41.000Z",
    "creator_name": "John Doe"
  }
}
```

**Status Code:** 200 OK

---

### 5. Delete Group

**Description:** Deletes a group from the system.

**Endpoint:** `DELETE /api/groups/:group_id`

**Controller Function:** `deleteGroup`

**Authentication Required:** Yes (Bearer Token)

**Parameters:**

- `group_id` (URL parameter): The ID of the group to delete

**Response:**

```json
{
  "success": true,
  "message": "Group deleted successfully"
}
```

**Status Code:** 200 OK

---

## Error Responses

**Invalid Input:**

```json
{
  "success": false,
  "message": "Invalid input data"
}
```

**Status Code:** 400 Bad Request

**Group Not Found:**

```json
{
  "success": false,
  "message": "Group not found"
}
```

**Status Code:** 404 Not Found

**Unauthorized Access:**

```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Status Code:** 401 Unauthorized

**Forbidden:**

```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

**Status Code:** 403 Forbidden

**Server Error:**

```json
{
  "success": false,
  "message": "Internal server error"
}
```

**Status Code:** 500 Internal Server Error
