# Thadam AI — API Reference

Base URL: `http://localhost:5000`

All responses wrapped in `ApiResponse<T>`:
```json
{ "success": true, "message": "...", "data": { ... } }
```

Error responses use same envelope with `success: false`.

---

## Authentication

### Register

```
POST /api/auth/register
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User registered successfully!",
  "data": { "id": 1, "name": "John Doe", "email": "john@example.com" }
}
```

**Errors:** 409 (duplicate email), 400 (validation)

---

### Login

```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "uuid-uuid"
  }
}
```

**Errors:** 401 (invalid credentials)

---

### Refresh Token

```
POST /api/auth/refresh
```

**Request:**
```json
{
  "refreshToken": "uuid-uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "new-uuid-new-uuid"
  }
}
```

**Errors:** 401 (expired/invalid), 409 (reuse detected — all tokens revoked)

---

### Logout

```
POST /api/auth/logout
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{ "success": true, "message": "Logged out successfully", "data": null }
```

---

### Current User

```
GET /api/auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Current User",
  "data": { "id": 1, "name": "John Doe", "email": "john@example.com" }
}
```

---

## Users

### Create User (Admin)

```
POST /api/user
```

**Headers:** `Authorization: Bearer <token>` (ADMIN only)

**Request:**
```json
{ "name": "Jane", "email": "jane@example.com" }
```

**Response (200):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": { "id": 2, "name": "Jane", "email": "jane@example.com" }
}
```

**Note:** This is an admin-only path that creates users without password hashing.

---

### Get User By ID

```
GET /api/user/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": { "id": 1, "name": "John Doe", "email": "john@example.com" }
}
```

**Errors:** 404

---

### Get All Users (Admin)

```
GET /api/user
```

**Headers:** `Authorization: Bearer <token>` (ADMIN only)

**Response (200):**
```json
{
  "success": true,
  "message": "Fetched all users successfully",
  "data": [
    { "id": 1, "name": "John Doe", "email": "john@example.com" }
  ]
}
```

---

### Update User

```
PUT /api/user/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{ "name": "John Updated", "email": "john.new@example.com" }
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": { "id": 1, "name": "John Updated", "email": "john.new@example.com" }
}
```

---

### Delete User (Admin)

```
DELETE /api/user/{id}
```

**Headers:** `Authorization: Bearer <token>` (ADMIN only)

**Response (200):**
```json
{ "success": true, "message": "User deleted successfully", "data": null }
```

---

## Admin

All admin endpoints require `Authorization: Bearer <token>` with ADMIN role.

### List All Users

```
GET /api/admin/users
```

**Response (200):**
```json
{
  "success": true,
  "message": "Fetched all users",
  "data": [
    { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "USER", "active": true }
  ]
}
```

---

### Get User By ID (Admin)

```
GET /api/admin/users/{id}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "USER", "active": true }
}
```

---

### Delete User (Admin)

```
DELETE /api/admin/users/{id}
```

**Response (200):**
```json
{ "success": true, "message": "User deleted successfully", "data": null }
```

---

### Change User Role (Admin)

```
PATCH /api/admin/users/{id}/role
```

**Request:**
```json
{ "role": "MODERATOR" }
```

**Response (200):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "MODERATOR", "active": true }
}
```

---

## OAuth2 — Google Login

### Initiate Google Login

```
GET /oauth2/authorization/google
```

Redirects to Google's OAuth consent screen.

### OAuth2 Callback

```
GET /login/oauth2/code/google?code=...
```

Handled internally by Spring Security. On success, redirects to frontend with tokens:

```
http://localhost:3000/oauth2/redirect?accessToken=...&refreshToken=...
```

---

## Roadmaps

All roadmap endpoints require `Authorization: Bearer <token>`.

### Create Roadmap

```
POST /api/roadmaps
```

**Request:**
```json
{ "title": "My Roadmap", "description": "Learn something new" }
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": 1, "title": "My Roadmap", "description": "Learn something new", "status": "ACTIVE", "userId": 1, "milestoneCount": 0, "taskCount": 0, "forkedFromId": null, "createdAt": "...", "updatedAt": "..." }
}
```

---

### List My Roadmaps

```
GET /api/roadmaps?page=0&size=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "totalPages": 1,
    "totalElements": 1,
    "size": 10,
    "number": 0,
    "empty": false
  }
}
```

---

### Get Roadmap By ID

```
GET /api/roadmaps/{id}
```

**Response (200):** Single `RoadmapResponse` object.

**Errors:** 404

---

### Update Roadmap

```
PUT /api/roadmaps/{id}
```

**Request:**
```json
{ "title": "Updated Title", "description": "Updated description", "status": "ACTIVE" }
```

**Errors:** 403 (not owner), 404

---

### Delete Roadmap

```
DELETE /api/roadmaps/{id}
```

**Response (204):** No content.

**Errors:** 403 (not owner), 404

---

### AI-Generate Roadmap

```
POST /api/roadmaps/generate
```

Generates a structured roadmap with milestones and tasks via Google Gemini.

**Request:**
```json
{ "prompt": "Learn Python in 4 weeks beginner" }
```

**Response (201):** Single `RoadmapResponse` with milestones and tasks populated.

**Errors:** 500 (Gemini API failure, missing prompt template)

---

### Browse Community Roadmaps

```
GET /api/roadmaps/public?page=0&size=20
```

Returns all roadmaps with vote counts, user vote, fork count, and author name.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "...",
        "userName": "John",
        "upvoteCount": 5,
        "downvoteCount": 1,
        "userVote": "UPVOTE",
        "forkCount": 3,
        "forkedFromId": null,
        "milestoneCount": 4,
        "taskCount": 12
      }
    ],
    "totalPages": 1,
    "totalElements": 1,
    "size": 20,
    "number": 0,
    "empty": false
  }
}
```

---

### Fork a Roadmap

```
POST /api/roadmaps/{id}/fork
```

Creates a copy of the roadmap including all milestones and tasks, owned by the requesting user. The new roadmap has `forkedFromId` pointing to the original.

**Response (201):** Single `RoadmapResponse` for the new fork.

---

## Voting

### Vote on a Roadmap

```
POST /api/roadmaps/{id}/votes
```

**Request:**
```json
{ "voteType": "UPVOTE" }
```

Voting same type again removes the vote (toggle). Voting opposite type switches.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "roadmapId": 1,
    "voteType": "UPVOTE",
    "upvoteCount": 5,
    "downvoteCount": 1
  }
}
```

---

### Get My Vote

```
GET /api/roadmaps/{id}/votes
```

Returns the current user's vote on a roadmap, or null fields if no vote exists.

---

## Milestones

### Create Milestone

```
POST /api/roadmaps/{roadmapId}/milestones
```

**Request:**
```json
{ "title": "Foundation", "description": "Core concepts", "orderIndex": 0, "dueDate": "2026-07-01" }
```

**Response (201):** Single `MilestoneResponse`.

**Errors:** 403 (not roadmap owner)

---

### Get Milestone

```
GET /api/roadmaps/milestones/{id}
```

---

### Update Milestone

```
PUT /api/roadmaps/milestones/{id}
```

**Errors:** 403 (not owner)

---

### Delete Milestone

```
DELETE /api/roadmaps/milestones/{id}
```

**Response (204):** No content.

---

### List Milestones by Roadmap

```
GET /api/roadmaps/{roadmapId}/milestones
```

**Response (200):** Array of `MilestoneResponse`.

---

## Tasks

### Create Task

```
POST /api/roadmaps/{roadmapId}/tasks
```

**Request:**
```json
{
  "title": "Install Python",
  "description": "Download and set up Python 3",
  "milestoneId": 1,
  "priority": "HIGH",
  "orderIndex": 0,
  "dueDate": "2026-06-20"
}
```

**Response (201):** Single `TaskResponse`.

---

### List Tasks by Roadmap

```
GET /api/roadmaps/{roadmapId}/tasks?page=0&size=50
```

**Response (200):** Paginated `TaskResponse` list.

---

### Get Task

```
GET /api/roadmaps/tasks/{id}
```

---

### Update Task

```
PATCH /api/roadmaps/tasks/{id}
```

**Request (partial update):**
```json
{ "status": "DONE" }
```

All fields optional. Can update: `title`, `description`, `milestoneId`, `assigneeId`, `status`, `priority`, `orderIndex`, `dueDate`.

---

### Delete Task

```
DELETE /api/roadmaps/tasks/{id}
```

**Response (204):** No content.

---

## Ledger / Coins

### Add Transaction

```
POST /api/ledger/transactions
```

**Request:**
```json
{ "amount": 10, "transactionType": "EARNED", "description": "Completed a task", "referenceType": "TASK", "referenceId": 1 }
```

**Response (201):** Single `CoinTransactionResponse`.

---

### Get My Balance

```
GET /api/ledger/balance
```

**Response (200):**
```json
{ "success": true, "data": { "userId": 1, "balance": 150 } }
```

---

### Get Balance by User (Admin)

```
GET /api/ledger/balance/{userId}
```

**Headers:** ADMIN only.

---

### List My Transactions

```
GET /api/ledger/transactions?page=0&size=20
```

---

### Get Single Transaction

```
GET /api/ledger/transactions/{id}
```

---

## People / Community Members

### List All Members

```
GET /api/user/public
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "USER", "roadmapCount": 5 }
  ]
}
```

---

## Error Responses

### 400 — Validation Error
```json
{
  "success": false,
  "message": "Validation Failed",
  "data": { "email": "Invalid Email", "password": "Password must be between 6-20 characters" }
}
```

### 401 — Unauthorized
```json
{ "success": false, "message": "Invalid Credentials", "data": null }
```

### 404 — Not Found
```json
{ "success": false, "message": "User not found with this id : 99", "data": null }
```

### 409 — Conflict
```json
{ "success": false, "message": "Email already exists", "data": null }
```

---

## cURL Examples

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Get current user
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"

# Refresh token
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<token>"}'

# Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <token>"

# List users (admin)
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <token>"

# Change role (admin)
curl -X PATCH http://localhost:5000/api/admin/users/1/role \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"role":"MODERATOR"}'

# Browse community roadmaps
curl http://localhost:5000/api/roadmaps/public \
  -H "Authorization: Bearer <token>"

# Upvote a roadmap
curl -X POST http://localhost:5000/api/roadmaps/1/votes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"voteType":"UPVOTE"}'

# Fork a roadmap
curl -X POST http://localhost:5000/api/roadmaps/1/fork \
  -H "Authorization: Bearer <token>"

# List community members
curl http://localhost:5000/api/user/public \
  -H "Authorization: Bearer <token>"

# AI-generate a roadmap
curl -X POST http://localhost:5000/api/roadmaps/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Learn React in 8 weeks intermediate"}'

# Search roadmaps
curl "http://localhost:5000/api/roadmaps/search?q=python" \
  -H "Authorization: Bearer <token>"

# List my roadmaps
curl http://localhost:5000/api/roadmaps \
  -H "Authorization: Bearer <token>"

# Get roadmap
curl http://localhost:5000/api/roadmaps/1 \
  -H "Authorization: Bearer <token>"
```
