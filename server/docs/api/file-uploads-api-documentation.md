# File Upload API Documentation

## Upload a File

Upload a file to a specific group. Only PDF and DOC files are allowed.

- **URL:** `/files`
- **Method:** `POST`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`

### Request Body

| Field   | Type   | Description                               |
| ------- | ------ | ----------------------------------------- |
| file    | File   | The file to upload (PDF or DOC only)      |
| groupId | number | The ID of the group to upload the file to |
| taskId  | number | (Optional) The ID of the associated task  |

### Success Response

- **Code:** 201
- **Content:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file_id": 123
}
```

### Error Responses

- **Code:** 400 BAD REQUEST

```json
{
  "success": false,
  "message": "Invalid file type. Only PDF and DOC files are allowed."
}
```

- **Code:** 413 PAYLOAD TOO LARGE

```json
{
  "success": false,
  "message": "File size exceeds 5MB limit"
}
```

## Get Files by Group

Retrieve all files uploaded to a specific group.

- **URL:** `/files/group/:groupId`
- **Method:** `GET`
- **Auth Required:** Yes

### Success Response

- **Code:** 200
- **Content:**

```json
{
  "success": true,
  "files": [
    {
      "file_id": 123,
      "filename": "1683472444-document.pdf",
      "original_filename": "document.pdf",
      "file_type": "application/pdf",
      "file_size": 1024576,
      "task_id": 1,
      "group_id": 1,
      "uploaded_by": 1,
      "uploaded_at": "2025-05-07T10:00:44Z",
      "uploader": {
        "username": "john_doe",
        "full_name": "John Doe"
      },
      "group": {
        "name": "Study Group A"
      }
    }
  ]
}
```

## Get All Files (Admin Only)

Retrieve all files uploaded across all groups.

- **URL:** `/files/all`
- **Method:** `GET`
- **Auth Required:** Yes (Admin only)

### Success Response

- **Code:** 200
- **Content:** Same as Get Files by Group, but includes files from all groups

### Error Response

- **Code:** 403 FORBIDDEN

```json
{
  "success": false,
  "message": "Admin access required"
}
```

## Download File

Download a specific file.

- **URL:** `/files/:fileId/download`
- **Method:** `GET`
- **Auth Required:** Yes

### Success Response

- **Code:** 200
- **Content:** File stream with appropriate headers

### Error Response

- **Code:** 404 NOT FOUND

```json
{
  "success": false,
  "message": "File not found"
}
```
