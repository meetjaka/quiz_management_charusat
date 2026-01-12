# 🎓 University Quiz Management System - API Documentation

## Base URL

```
http://localhost:5001/api
```

## Authentication

All protected routes require JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User

```http
POST /auth/register
```

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "password123",
  "role": "student",
  "enrollmentNumber": "EN001",
  "department": "Computer Science",
  "semester": "6",
  "batch": "2023"
}
```

### Login

```http
POST /auth/login
```

**Rate Limited:** 5 attempts per 15 minutes
**Body:**

```json
{
  "email": "john@university.edu",
  "password": "password123"
}
```

**Response:**

```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@university.edu",
  "role": "student",
  "token": "jwt_token_here"
}
```

### Get Current User

```http
GET /auth/me
```

**Auth Required:** Yes

### Logout

```http
POST /auth/logout
```

**Auth Required:** Yes

### Change Password

```http
PUT /auth/change-password
```

**Auth Required:** Yes
**Body:**

```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## 🔴 Admin Endpoints

All admin endpoints require Admin role.

### User Management

#### Get All Users

```http
GET /admin/users?role=student&department=CSE&semester=6
```

**Query Params:**

- `role`: admin, coordinator, student
- `department`: Department name
- `semester`: Semester number
- `batch`: Batch year
- `isActive`: true/false
- `search`: Search by name, email, or enrollment number

#### Get User By ID

```http
GET /admin/users/:id
```

#### Create User

```http
POST /admin/users
```

**Body:** Same as register

#### Update User

```http
PUT /admin/users/:id
```

**Body:** Fields to update (password excluded)

#### Delete User

```http
DELETE /admin/users/:id
```

#### Bulk Upload Students

```http
POST /admin/users/bulk-upload
```

**Content-Type:** multipart/form-data
**Body:** Excel file with columns: name, email, password, enrollmentNumber, department, semester, batch

**Response:**

```json
{
  "success": true,
  "data": {
    "success": ["email1@example.com", "email2@example.com"],
    "failed": [
      { "email": "email3@example.com", "reason": "User already exists" }
    ]
  }
}
```

#### Toggle User Status

```http
PATCH /admin/users/:id/toggle-status
```

### Quiz Management

#### Get All Quizzes

```http
GET /admin/quizzes?department=CSE&semester=6&isActive=true
```

**Query Params:**

- `department`, `semester`, `subject`, `batch`
- `isActive`, `isPublished`: true/false

#### Get Quiz By ID

```http
GET /admin/quizzes/:id
```

**Returns:** Quiz with all questions

#### Create Quiz

```http
POST /admin/quizzes
```

**Body:**

```json
{
  "title": "Data Structures Final",
  "description": "Final exam for DS",
  "department": "CSE",
  "semester": "4",
  "subject": "Data Structures",
  "batch": "2023",
  "startTime": "2026-01-15T10:00:00Z",
  "endTime": "2026-01-15T12:00:00Z",
  "duration": 120,
  "totalMarks": 100,
  "passingMarks": 40
}
```

#### Create Quiz from Excel

```http
POST /admin/quizzes/upload-excel
```

**Content-Type:** multipart/form-data
**Body:**

- `file`: Excel file with columns: question, optionA, optionB, optionC, optionD, correctAnswer, marks
- `title`, `description`, `department`, `semester`, `subject`, `batch`, `startTime`, `endTime`, `duration`, `passingMarks`

#### Update Quiz

```http
PUT /admin/quizzes/:id
```

#### Delete Quiz

```http
DELETE /admin/quizzes/:id
```

**Note:** Cannot delete quiz with existing attempts

#### Assign Coordinators

```http
PUT /admin/quizzes/:id/assign-coordinators
```

**Body:**

```json
{
  "coordinatorIds": ["coord_id_1", "coord_id_2"]
}
```

#### Toggle Quiz Active Status

```http
PATCH /admin/quizzes/:id/toggle-active
```

#### Toggle Quiz Publish Status

```http
PATCH /admin/quizzes/:id/toggle-publish
```

#### Invalidate Student Attempt

```http
POST /admin/quizzes/:quizId/invalidate-attempt/:attemptId
```

**Body:**

```json
{
  "reason": "Violation of quiz rules"
}
```

### Analytics

#### Dashboard Analytics

```http
GET /admin/analytics/dashboard
```

**Returns:** Overview statistics, recent activity, department stats

#### Quiz Analytics

```http
GET /admin/analytics/quiz/:id
```

**Returns:** Attempt rate, pass/fail stats, score distribution, top performers

#### Student Analytics

```http
GET /admin/analytics/student/:id
```

**Returns:** Student performance across all quizzes

#### System Analytics

```http
GET /admin/analytics/system
```

**Returns:** System-wide statistics

---

## 🟠 Coordinator Endpoints

All coordinator endpoints require Coordinator or Admin role.

### Get Assigned Quizzes

```http
GET /coordinator/quizzes
```

### Get Quiz Details

```http
GET /coordinator/quizzes/:id
```

### Update Quiz Metadata

```http
PUT /coordinator/quizzes/:id/metadata
```

**Body:** (Only these fields allowed)

```json
{
  "startTime": "2026-01-15T10:00:00Z",
  "endTime": "2026-01-15T12:00:00Z",
  "duration": 120
}
```

### Get Quiz Results

```http
GET /coordinator/quizzes/:id/results
```

**Returns:** All student results with rankings

### Get Quiz Attempts

```http
GET /coordinator/quizzes/:id/attempts
```

### Export Results to Excel

```http
GET /coordinator/quizzes/:id/export
```

**Returns:** Excel file download

### Get Quiz Analytics

```http
GET /coordinator/quizzes/:id/analytics
```

---

## 🟢 Student Endpoints

All student endpoints require Student role.

### Get Available Quizzes

```http
GET /student/quizzes/available
```

**Returns:** Quizzes available for the student based on department, semester, batch, and time

### Get Quiz Details

```http
GET /student/quizzes/:id/details
```

**Returns:** Quiz information before starting (without questions)

### Start Quiz Attempt

```http
POST /student/quizzes/:id/start
```

**Rate Limited:** 50 requests per hour
**Returns:**

```json
{
  "success": true,
  "data": {
    "attemptId": "...",
    "quiz": { "title": "...", "duration": 120 },
    "questions": [...],
    "startedAt": "...",
    "timeLimit": 7200
  }
}
```

### Submit Answer

```http
PUT /student/attempts/:attemptId/answer
```

**Body:**

```json
{
  "questionId": "question_id",
  "selectedAnswer": "A"
}
```

### Submit Quiz

```http
POST /student/attempts/:attemptId/submit
```

**Body:**

```json
{
  "isAutoSubmit": false
}
```

**Returns:** Score, percentage, pass/fail status

### Report Tab Switch

```http
POST /student/attempts/:attemptId/tab-switch
```

**Called automatically when student switches tabs during quiz**

### Get My Attempts

```http
GET /student/attempts
```

### Get My Results

```http
GET /student/results
```

### Get Result By ID

```http
GET /student/results/:id
```

---

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10
}
```

### Error Response

```json
{
  "message": "Error description"
}
```

---

## 🔒 Error Codes

- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Invalid/missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

---

## 📝 Excel File Formats

### Students Upload Template

| name     | email            | password | enrollmentNumber | department | semester | batch |
| -------- | ---------------- | -------- | ---------------- | ---------- | -------- | ----- |
| John Doe | john@example.com | pass123  | EN001            | CSE        | 6        | 2023  |

### Quiz Questions Template

| question     | optionA | optionB | optionC | optionD | correctAnswer | marks |
| ------------ | ------- | ------- | ------- | ------- | ------------- | ----- |
| What is 2+2? | 3       | 4       | 5       | 6       | B             | 2     |

---

## 🛡️ Security Features

- JWT token expiry: 7 days
- Password hashing: bcrypt (10 rounds)
- Rate limiting on sensitive endpoints
- Input validation using Joi
- Audit logging for all admin actions
- One quiz attempt per student (enforced at DB level)
- Tab switch detection and warning system
- Auto-submit on time expiry

---

## 🧪 Testing

### Create Test Admin

```bash
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@university.edu",
  "password": "admin123",
  "role": "admin"
}
```

### Create Test Coordinator

```bash
POST /api/admin/users (as admin)
{
  "name": "Coordinator User",
  "email": "coordinator@university.edu",
  "password": "coord123",
  "role": "coordinator",
  "department": "CSE"
}
```

### Create Test Student

```bash
POST /api/admin/users (as admin)
{
  "name": "Student User",
  "email": "student@university.edu",
  "password": "student123",
  "role": "student",
  "enrollmentNumber": "EN001",
  "department": "CSE",
  "semester": "6",
  "batch": "2023"
}
```

---

**Backend Status:** ✅ Complete and Production Ready
**All API endpoints implemented and tested**
