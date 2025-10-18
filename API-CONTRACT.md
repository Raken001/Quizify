# Quizify API Contract

Base URL: `http://localhost:8000`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens expire after 30 minutes.

---

## 1. Authentication Routes (`/auth`)

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",      // optional
  "lastName": "Doe"          // optional
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Errors:**
- 400: Email already exists
- 400: Invalid email format
- 500: Registration failed

---

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Errors:**
- 401: Invalid credentials
- 500: Login failed

---

## 2. User Routes (`/users`)

### GET /users/profile
Get current user's full profile (requires authentication).

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://...",
    "bio": "Software developer"
  },
  "preferences": {
    "dailyGoal": 20,
    "studyReminders": true,
    "theme": "auto",
    "notifications": {
      "email": true,
      "push": false
    }
  },
  "stats": {
    "totalFlashcards": 45,
    "quizzesTaken": 12,
    "averageScore": 85,
    "studyStreak": 7,
    "lastStudyDate": "2025-10-18T10:30:00.000Z"
  },
  "createdAt": "2025-10-01T08:00:00.000Z",
  "updatedAt": "2025-10-18T10:30:00.000Z"
}
```

---

### PUT /users/profile
Update current user's profile (requires authentication).

**Request Body:**
```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Updated bio"
  },
  "preferences": {
    "dailyGoal": 25,
    "theme": "dark"
  }
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "profile": { ... },
  "preferences": { ... }
}
```

---

## 3. Flashcard Routes (`/flashcards`)

### GET /flashcards
Get all flashcards for the current user with filtering and pagination.

**Query Parameters:**
- `subject` (string, optional): Filter by subject
- `tags` (string, optional): Comma-separated tags
- `difficulty` (string, optional): easy | medium | hard
- `search` (string, optional): Search in question/answer
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page

**Response (200):**
```json
{
  "flashcards": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f191e810c19729de860ea",
      "question": "What is React?",
      "answer": "A JavaScript library for building user interfaces",
      "subject": "Programming",
      "tags": ["react", "javascript", "frontend"],
      "difficulty": "medium",
      "statistics": {
        "timesAnswered": 10,
        "timesCorrect": 8,
        "lastAnswered": "2025-10-18T10:00:00.000Z"
      },
      "createdAt": "2025-10-01T08:00:00.000Z",
      "updatedAt": "2025-10-18T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### GET /flashcards/:id
Get a single flashcard by ID.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "question": "What is React?",
  "answer": "A JavaScript library for building user interfaces",
  "subject": "Programming",
  "tags": ["react", "javascript", "frontend"],
  "difficulty": "medium",
  "statistics": {
    "timesAnswered": 10,
    "timesCorrect": 8,
    "lastAnswered": "2025-10-18T10:00:00.000Z"
  }
}
```

**Errors:**
- 404: Flashcard not found

---

### POST /flashcards
Create a new flashcard.

**Request Body:**
```json
{
  "question": "What is React?",
  "answer": "A JavaScript library for building user interfaces",
  "subject": "Programming",
  "tags": ["react", "javascript"],
  "difficulty": "medium"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "question": "What is React?",
  "answer": "A JavaScript library for building user interfaces",
  "subject": "Programming",
  "tags": ["react", "javascript"],
  "difficulty": "medium",
  "statistics": {
    "timesAnswered": 0,
    "timesCorrect": 0
  },
  "createdAt": "2025-10-18T10:00:00.000Z",
  "updatedAt": "2025-10-18T10:00:00.000Z"
}
```

**Errors:**
- 400: Question and answer are required

---

### PUT /flashcards/:id
Update an existing flashcard (owner only).

**Request Body:**
```json
{
  "question": "What is React?",
  "answer": "Updated answer",
  "subject": "Programming",
  "tags": ["react", "javascript", "library"],
  "difficulty": "easy"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "question": "What is React?",
  "answer": "Updated answer",
  ...
}
```

**Errors:**
- 403: Not authorized to update this flashcard
- 404: Flashcard not found

---

### DELETE /flashcards/:id
Delete a flashcard (owner only).

**Response (200):**
```json
{
  "message": "Flashcard deleted"
}
```

**Errors:**
- 403: Not authorized to delete this flashcard
- 404: Flashcard not found

---

### GET /flashcards/subjects
Get list of unique subjects for the current user.

**Response (200):**
```json
{
  "subjects": ["Programming", "Mathematics", "Science", "History"]
}
```

---

### GET /flashcards/tags
Get list of all tags used by the current user.

**Response (200):**
```json
{
  "tags": ["react", "javascript", "python", "algorithms", "data-structures"]
}
```

---

## 4. Quiz Routes (`/quiz`)

### POST /quiz/start
Start a new quiz session.

**Request Body:**
```json
{
  "subject": "Programming",     // optional, "all" for all subjects
  "difficulty": "medium",       // optional, "all" for all difficulties
  "count": 10,                  // number of questions (default: 10)
  "randomOrder": true           // randomize questions (default: true)
}
```

**Response (201):**
```json
{
  "sessionId": "507f1f77bcf86cd799439011",
  "totalQuestions": 10,
  "firstQuestion": {
    "_id": "507f191e810c19729de860ea",
    "question": "What is React?",
    "subject": "Programming",
    "difficulty": "medium",
    "tags": ["react", "javascript"]
  }
}
```

**Errors:**
- 400: count must be at least 1
- 404: No flashcards found matching criteria

---

### GET /quiz/:sessionId
Get current quiz session state.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "flashcardIds": [
    {
      "_id": "...",
      "question": "What is React?",
      "answer": "...",
      "subject": "Programming",
      "difficulty": "medium"
    }
  ],
  "answers": [
    {
      "questionId": "507f191e810c19729de860ea",
      "userAnswer": "A library",
      "correctAnswer": "A JavaScript library",
      "isCorrect": true,
      "timeSpent": 15
    }
  ],
  "status": "active",
  "startTime": "2025-10-18T10:00:00.000Z",
  "subject": "Programming",
  "difficulty": "medium"
}
```

**Errors:**
- 404: Quiz session not found

---

### PUT /quiz/:sessionId/answer
Submit an answer for the current question.

**Request Body:**
```json
{
  "questionId": "507f191e810c19729de860ea",
  "userAnswer": "A JavaScript library",
  "timeSpent": 15                           // optional, time in seconds
}
```

**Response (200):**
```json
{
  "isCorrect": true,
  "currentIndex": 1,
  "totalQuestions": 10,
  "isComplete": false
}
```

**Errors:**
- 400: questionId and userAnswer are required
- 400: Quiz is not active
- 404: Quiz session not found
- 404: Flashcard not found

---

### POST /quiz/:sessionId/complete
Complete the quiz and generate results.

**Request Body:**
```json
{}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "sessionId": "507f191e810c19729de860ea",
  "summary": {
    "score": 85,
    "totalQuestions": 10,
    "correctAnswers": 8,
    "incorrectAnswers": 2,
    "grade": "B",
    "timeSpent": 150,
    "averageTimePerQuestion": 15
  },
  "breakdown": {
    "bySubject": [
      {
        "subject": "Programming",
        "correct": 8,
        "total": 10,
        "percentage": 80
      }
    ],
    "byDifficulty": [
      {
        "difficulty": "medium",
        "correct": 8,
        "total": 10,
        "percentage": 80
      }
    ],
    "answerSpeed": {
      "fast": 0,
      "medium": 0,
      "slow": 0
    }
  },
  "completedAt": "2025-10-18T10:05:00.000Z"
}
```

**Errors:**
- 404: Quiz session not found

---

### GET /quiz/:sessionId/results
Get results for a completed quiz session.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "summary": {
    "score": 85,
    "totalQuestions": 10,
    "correctAnswers": 8,
    "incorrectAnswers": 2,
    "grade": "B",
    "timeSpent": 150
  },
  "breakdown": { ... },
  "completedAt": "2025-10-18T10:05:00.000Z"
}
```

**Errors:**
- 404: Results not found

---

### GET /quiz/history
Get user's quiz history with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response (200):**
```json
{
  "results": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "summary": {
        "score": 85,
        "totalQuestions": 10,
        "correctAnswers": 8,
        "grade": "B"
      },
      "completedAt": "2025-10-18T10:05:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

## 5. Admin Routes (`/admin`)

**Note:** All admin routes require the user to have `role: "admin"`.

### GET /admin/stats
Get system-wide statistics.

**Response (200):**
```json
{
  "today": {
    "date": "2025-10-18T00:00:00.000Z",
    "stats": {
      "totalUsers": 150,
      "activeUsers": 45,
      "newUsers": 5,
      "totalFlashcards": 2500,
      "newFlashcards": 0,
      "totalQuizzes": 500,
      "completedQuizzes": 30,
      "averageQuizScore": 78,
      "totalStudyTime": 0
    }
  },
  "overall": {
    "totalUsers": 150,
    "totalFlashcards": 2500,
    "totalQuizzes": 500
  }
}
```

**Errors:**
- 403: Admin access required

---

### GET /admin/users
Get list of all users with pagination and filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional): Search by email
- `role` (string, optional): Filter by role (user | admin)

**Response (200):**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "role": "user",
      "profile": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "stats": {
        "totalFlashcards": 45,
        "quizzesTaken": 12,
        "averageScore": 85
      },
      "createdAt": "2025-10-01T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Errors:**
- 403: Admin access required

---

### PUT /admin/users/:id/role
Change a user's role.

**Request Body:**
```json
{
  "role": "admin"    // "user" or "admin"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "admin",
  "profile": { ... }
}
```

**Errors:**
- 400: Invalid role. Must be "user" or "admin"
- 400: Cannot change your own role
- 403: Admin access required
- 404: User not found

---

### DELETE /admin/users/:id
Delete a user account.

**Response (200):**
```json
{
  "message": "User deleted"
}
```

**Errors:**
- 400: Cannot delete your own account
- 403: Admin access required
- 404: User not found

---

## Data Models

### User
```typescript
{
  _id: ObjectId,
  email: string,
  passwordHash: string,
  role: "user" | "admin",
  profile: {
    firstName?: string,
    lastName?: string,
    avatar?: string,
    bio?: string
  },
  preferences: {
    dailyGoal?: number,
    studyReminders?: boolean,
    theme?: "light" | "dark" | "auto",
    notifications?: {
      email?: boolean,
      push?: boolean
    }
  },
  stats: {
    totalFlashcards: number,
    quizzesTaken: number,
    averageScore: number,
    studyStreak: number,
    lastStudyDate?: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Flashcard
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  question: string,
  answer: string,
  subject: string,
  tags: string[],
  difficulty: "easy" | "medium" | "hard",
  statistics: {
    timesAnswered: number,
    timesCorrect: number,
    lastAnswered?: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### QuizSession
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  flashcardIds: ObjectId[],
  answers: [{
    questionId: ObjectId,
    userAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
    timeSpent: number
  }],
  status: "active" | "completed" | "abandoned",
  startTime: Date,
  endTime?: Date,
  subject?: string,
  difficulty?: string
}
```

### QuizResult
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: ObjectId,
  summary: {
    score: number,
    totalQuestions: number,
    correctAnswers: number,
    incorrectAnswers: number,
    grade: "A" | "B" | "C" | "D" | "F",
    timeSpent: number,
    averageTimePerQuestion: number
  },
  breakdown: {
    bySubject: [{
      subject: string,
      correct: number,
      total: number,
      percentage: number
    }],
    byDifficulty: [{
      difficulty: string,
      correct: number,
      total: number,
      percentage: number
    }],
    answerSpeed: {
      fast: number,
      medium: number,
      slow: number
    }
  },
  completedAt: Date
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
