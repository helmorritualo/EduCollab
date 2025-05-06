# Group Members and Teacher Groups API Documentation

This document provides detailed information about the group membership, teacher groups, and teacher group invitation API endpoints in the EduCollab System.

## Group Member Endpoints

### 1. Join Group

**Description:** Allows a user to join an existing group using a group code.

**Endpoint:** `POST /api/groups/join`

**Controller Function:** `joinGroup`

**Authentication Required:** Yes (Bearer Token)

**Request Body:**
```json
{
  "group_code": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Joined successfully"
}
```

**Status Code:** 200 OK

---

### 1. Leave Group

**Description:** Allows a user to leave a group.

**Endpoint:** `POST /api/groups/:group_id/leave`

**Controller Function:** `leaveGroup`

**Authentication Required:** Yes (Bearer Token)

**Parameters:**
- `group_id` (URL parameter): The ID of the group to leave

**Response:**
```json
{
  "success": true,
  "message": "Left group successfully"
}
```

**Status Code:** 200 OK

---

### 2. List User Groups

**Description:** Retrieves all groups that the authenticated user is a member of.

**Endpoint:** `GET /api/user/groups`

**Controller Function:** `listUserGroups`

**Authentication Required:** Yes (Bearer Token)

**Response:**
```json
{
    "success": true,
    "message": "Groups retrieved successfully",
    "groups": [
        {
            "group_id": 5,
            "name": "New Study Group",
            "description": "A new group for collaborative study",
            "creator_name": "John Doe"
        },
        //... other groups
    ]
}
```

**Status Code:** 200 OK

---

### 3. Get Group Details

**Description:** Retrieves detailed information about a specific group, including its members.

**Endpoint:** `GET /api/groups/:group_id/details`

**Controller Function:** `getGroupDetails`

**Authentication Required:** Yes (Bearer Token)

**Parameters:**
- `group_id` (URL parameter): The ID of the group to retrieve details for

**Response:**
```json
{
    "success": true,
    "message": "Group details retrieved successfully",
    "group": {
        "group_id": 5,
        "name": "New Study Group",
        "description": "A new group for collaborative study",
        "group_code": "AJNcv9BR",
        "creator_name": "John Doe",
        "members": [
            {
                "full_name": "John Doe",
                "email": "johndoe@gmail.com",
                "gender": "male",
                "role": "student"
            },
            // ... other members
        ]
    }
}
```

**Status Code:** 200 OK

## Teacher Group Invitation Endpoints

### 1. Create Teacher Group Invitation

**Description:** Creates an invitation for a teacher to join a group.

**Endpoint:** `POST /api/teacher-group-invitations`

**Controller Function:** `createTeacherGroupInvitation`

**Authentication Required:** Yes (Bearer Token)

**Request Body:**
```json
{
  "group_name": "Math Study Group",
  "invited_teacher_name": "Jane Doe",
  "project_details": "This is a collaborative project for mathematics education"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation created successfully",
  "invitation": {
    "invitation_id": 1,
    "group_id": 1,
    "invited_teacher_id": 2,
    "invited_by": 1,
    "status": "pending",
    "project_details": "This is a collaborative project for mathematics education",
    "created_at": "2023-01-05T00:00:00.000Z",
    "updated_at": "2023-01-05T00:00:00.000Z"
  }
}
```

**Status Code:** 201 Created

---

### 2. Get Invitations For Teacher

**Description:** Retrieves all invitations for the authenticated teacher.

**Endpoint:** `GET /api/teacher-group-invitations`

**Controller Function:** `getInvitationsForTeacher`

**Authentication Required:** Yes (Bearer Token)

**Response:**
```json
{
  "success": true,
  "message": "Invitations retrieved successfully",
  "invitations": [
    {
      "invitation_id": 1,
      "group_id": 1,
      "group_name": "Math Study Group",
      "invited_teacher_id": 2,
      "invited_by": 1,
      "inviter_name": "John Doe",
      "status": "pending",
      "project_details": "This is a collaborative project for mathematics education",
      "created_at": "2023-01-05T00:00:00.000Z",
      "updated_at": "2023-01-05T00:00:00.000Z"
    }
  ]
}
```

**Status Code:** 200 OK

---

### 3. Respond To Invitation

**Description:** Allows a teacher to respond to a group invitation (approve or reject).

**Endpoint:** `PATCH /api/teacher-group-invitations/:invitation_id`

**Controller Function:** `respondToInvitation`

**Authentication Required:** Yes (Bearer Token)

**Parameters:**
- `invitation_id` (URL parameter): The ID of the invitation to respond to

**Request Body:**
```json
{
  "status": "approved" // or "rejected"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation approved successfully" // or "Invitation rejected successfully"
}
```
**Status Code:** 200 OK

---

## Error Responses

**Invalid Input:**
```json
{
  "success": false,
  "message": "Invalid invitation ID or status"
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

**Invalid Group Code:**
```json
{
  "success": false,
  "message": "Invalid group code"
}
```
**Status Code:** 400 Bad Request

**Unauthorized Access:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```
**Status Code:** 401 Unauthorized

**Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```
**Status Code:** 500 Internal Server Error