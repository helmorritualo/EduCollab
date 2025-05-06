# Tasks API Documentation

This document provides detailed information about the task management API endpoints in the EduCollab System.

Base URL: `http://localhost:5000`

## Authentication

All endpoints require authentication using a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Authorization

- Regular users can create and manage their own tasks
- Admin users can manage all tasks
- Users can only update and delete tasks they created (except admins who can manage all tasks)
- Tasks are associated with groups and can be assigned to specific users

## Endpoints

### 1. Create Task

**Description:** Creates a new task in the system.

**Endpoint:** `POST /api/tasks`

**Controller Function:** `createTask`

**Authentication Required:** Yes (Bearer Token)

**Request Body:**

```json
{
  "title": "Complete Project Documentation",
  "description": "Write comprehensive documentation for the project",
  "status": "pending",
  "due_date": "2023-12-31T23:59:59.999Z",
  "group_id": 1,
  "assigned_to": 3
}
```

**Request Body Parameters:**

| Parameter    | Type      | Required | Description                                     |
|--------------|-----------|----------|-------------------------------------------------|
| title        | string    | Yes      | The title of the task                          |
| description  | string    | Yes      | Detailed description of the task               |
| status       | string    | Yes      | Current status of the task (pending, in_progress, completed) |
| due_date     | ISO date  | Yes      | Deadline for task completion                   |
| group_id     | integer   | Yes      | ID of the group this task belongs to           |
| assigned_to  | integer   | No       | ID of the user this task is assigned to        |

**Response:**

```json
{
  "success": true,
  "message": "Task created successfully",
  "task_id": 1
}
```

**Status Code:** 201 Created

---

### 2. Update Task

**Description:** Updates an existing task's details.

**Endpoint:** `PUT /api/tasks/:task_id`

**Controller Function:** `updateTask`

**Authentication Required:** Yes (Bearer Token)

**Authorization:** Only the task creator or an admin can update a task

**URL Parameters:**

- `task_id` (integer): The ID of the task to update

**Request Body:**

```json
{
  "title": "Updated Task Title",
  "description": "Updated task description with more details",
  "status": "in_progress",
  "due_date": "2023-12-15T23:59:59.999Z",
  "group_id": 1,
  "assigned_to": 4
}
```

**Request Body Parameters:**

| Parameter    | Type      | Required | Description                                     |
|--------------|-----------|----------|-------------------------------------------------|
| title        | string    | Yes      | The updated title of the task                  |
| description  | string    | Yes      | Updated description of the task                |
| status       | string    | Yes      | Updated status of the task                     |
| due_date     | ISO date  | Yes      | Updated deadline for task completion           |
| group_id     | integer   | Yes      | ID of the group this task belongs to           |
| assigned_to  | integer   | No       | ID of the user this task is assigned to        |

**Response:**

```json
{
  "success": true,
  "message": "Task updated successfully"
}
```

**Status Code:** 200 OK

---

### 3. Update Task Status

**Description:** Updates only the status of an existing task.

**Endpoint:** `PATCH /api/tasks/:task_id/status`

**Controller Function:** `updateTaskStatus`

**Authentication Required:** Yes (Bearer Token)

**URL Parameters:**

- `task_id` (integer): The ID of the task to update status

**Request Body:**

```json
{
  "status": "completed"
}
```

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| status    | string | Yes      | New status of the task (pending, in_progress, completed) |

**Response:**

```json
{
  "success": true,
  "message": "Task status updated successfully"
}
```

**Status Code:** 200 OK

---

### 4. Delete Task

**Description:** Deletes a specific task from the system.

**Endpoint:** `DELETE /api/tasks/:task_id`

**Controller Function:** `deleteTask`

**Authentication Required:** Yes (Bearer Token)

**Authorization:** Only the task creator or an admin can delete a task

**URL Parameters:**

- `task_id` (integer): The ID of the task to delete

**Response:**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Status Code:** 200 OK

---

### 5. Get Task By ID

**Description:** Retrieves a specific task by its ID.

**Endpoint:** `GET /api/tasks/:task_id`

**Controller Function:** `getTaskById`

**Authentication Required:** Yes (Bearer Token)

**URL Parameters:**

- `task_id` (integer): The ID of the task to retrieve

**Response:**

```json
{
  "success": true,
  "task": {
    "task_id": 1,
    "title": "Complete Project Documentation",
    "description": "Write comprehensive documentation for the project",
    "status": "in_progress",
    "due_date": "2023-12-31T23:59:59.999Z",
    "group_id": 1,
    "created_by": 2,
    "assigned_to": 3,
    "created_at": "2023-11-15T14:30:00.000Z",
    "updated_at": "2023-11-16T09:45:00.000Z",
    "creator_name": "John Doe",
    "assignee_name": "Jane Smith",
    "group_name": "Project Alpha Team"
  }
}
```

**Status Code:** 200 OK

---

### 6. Get Tasks By Group ID

**Description:** Retrieves all tasks associated with a specific group.

**Endpoint:** `GET /api/groups/:group_id/tasks`

**Controller Function:** `getTasksByGroupId`

**Authentication Required:** Yes (Bearer Token)

**URL Parameters:**

- `group_id` (integer): The ID of the group to retrieve tasks for

**Response:**

```json
{
  "success": true,
  "tasks": [
    {
      "task_id": 1,
      "title": "Complete Project Documentation",
      "description": "Write comprehensive documentation for the project",
      "status": "in_progress",
      "due_date": "2023-12-31T23:59:59.999Z",
      "group_id": 1,
      "created_by": 2,
      "assigned_to": 3,
      "created_at": "2023-11-15T14:30:00.000Z",
      "updated_at": "2023-11-16T09:45:00.000Z",
      "creator_name": "John Doe",
      "assignee_name": "Jane Smith"
    },
    {
      "task_id": 2,
      "title": "Implement User Authentication",
      "description": "Add JWT authentication to the API",
      "status": "completed",
      "due_date": "2023-11-20T23:59:59.999Z",
      "group_id": 1,
      "created_by": 2,
      "assigned_to": 4,
      "created_at": "2023-11-10T11:15:00.000Z",
      "updated_at": "2023-11-18T16:30:00.000Z",
      "creator_name": "John Doe",
      "assignee_name": "Mike Johnson"
    }
  ]
}
```

**Status Code:** 200 OK

---

### 7. Get Tasks By User ID

**Description:** Retrieves all tasks assigned to the authenticated user.

**Endpoint:** `GET /api/tasks/my-tasks`

**Controller Function:** `getTasksByUserId`

**Authentication Required:** Yes (Bearer Token)

**Response:**

```json
{
  "success": true,
  "tasks": [
    {
      "task_id": 3,
      "title": "Design Database Schema",
      "description": "Create ERD and implement database schema",
      "status": "pending",
      "due_date": "2023-12-10T23:59:59.999Z",
      "group_id": 2,
      "created_by": 1,
      "assigned_to": 2,
      "created_at": "2023-11-18T09:00:00.000Z",
      "updated_at": "2023-11-18T09:00:00.000Z",
      "creator_name": "Admin User",
      "assignee_name": "John Doe",
      "group_name": "Database Team"
    },
    {
      "task_id": 5,
      "title": "Create API Documentation",
      "description": "Document all API endpoints",
      "status": "in_progress",
      "due_date": "2023-12-05T23:59:59.999Z",
      "group_id": 3,
      "created_by": 3,
      "assigned_to": 2,
      "created_at": "2023-11-20T13:45:00.000Z",
      "updated_at": "2023-11-21T10:30:00.000Z",
      "creator_name": "Jane Smith",
      "assignee_name": "John Doe",
      "group_name": "Documentation Team"
    }
  ]
}
```

**Status Code:** 200 OK

---

### 8. Get All Tasks

**Description:** Retrieves all tasks in the system. Typically used by administrators.

**Endpoint:** `GET /api/tasks`

**Controller Function:** `getAllTasks`

**Authentication Required:** Yes (Bearer Token)

**Response:**

```json
{
  "success": true,
  "tasks": [
    {
      "task_id": 1,
      "title": "Complete Project Documentation",
      "description": "Write comprehensive documentation for the project",
      "status": "in_progress",
      "due_date": "2023-12-31T23:59:59.999Z",
      "group_id": 1,
      "created_by": 2,
      "assigned_to": 3,
      "created_at": "2023-11-15T14:30:00.000Z",
      "updated_at": "2023-11-16T09:45:00.000Z",
      "creator_name": "John Doe",
      "assignee_name": "Jane Smith",
      "group_name": "Project Alpha Team"
    },
    {
      "task_id": 2,
      "title": "Implement User Authentication",
      "description": "Add JWT authentication to the API",
      "status": "completed",
      "due_date": "2023-11-20T23:59:59.999Z",
      "group_id": 1,
      "created_by": 2,
      "assigned_to": 4,
      "created_at": "2023-11-10T11:15:00.000Z",
      "updated_at": "2023-11-18T16:30:00.000Z",
      "creator_name": "John Doe",
      "assignee_name": "Mike Johnson",
      "group_name": "Project Alpha Team"
    }
  ]
}
```

**Status Code:** 200 OK

## Error Responses

All endpoints may return the following error responses:

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Unauthorized: No token provided"
}
```

### Forbidden (403)

```json
{
  "success": false,
  "message": "Forbidden: You don't have permission to perform this action"
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Task not found"
}
```

### Bad Request (400)

```json
{
  "success": false,
  "message": "Invalid request data",
  "errors": [
    "Title is required",
    "Due date must be a valid date"
  ]
}
```

### Internal Server Error (500)

```json
{
  "success": false,
  "message": "Internal server error"
}
```