# Quizify Project Design Document

## Overview
Quizify is a full-stack web application designed to facilitate quiz and flashcard management for users. The project is divided into two main components:
- **quizify-backend**: Node.js/Express backend with MongoDB for data storage.
- **quizify-frontend**: Angular-based frontend for user interaction.

This document outlines the architecture, data models, API design, frontend structure, authentication, and future considerations for Quizify.

---

## 1. Architecture

### 1.1. Backend (quizify-backend)
- **Framework**: Node.js with Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Features**:
  - RESTful API for flashcards, questions, and authentication
  - JWT-based authentication middleware
  - Modular route and model structure

### 1.2. Frontend (quizify-frontend)
- **Framework**: Angular
- **Features**:
  - SPA with routing for login, flashcards, questions, and add-question pages
  - HTTP interceptors for authentication
  - Responsive design with CSS

---

## 2. Backend Design

### 2.1. Folder Structure
- `auth.middleware.js`: JWT authentication middleware
- `auth.routes.js`: Authentication routes (login, register)
- `db.js` & `mongo.js`: Database connection logic
- `flashcards.routes.js`: Flashcard CRUD routes
- `questions.routes.js`: Question CRUD routes
- `server.js`: Main Express server entry point
- `models/Flashcard.js`: Mongoose model for flashcards

### 2.2. Data Models
#### Flashcard
```js
{
  question: String,
  answer: String,
  tags: [String],
  createdBy: ObjectId (User),
  createdAt: Date
}
```
#### User (assumed)
```js
{
  username: String,
  password: String (hashed),
  email: String,
  createdAt: Date
}
```
#### Question
```js
{
  text: String,
  options: [String],
  correctAnswer: String,
  tags: [String],
  createdBy: ObjectId (User),
  createdAt: Date
}
```

### 2.3. API Endpoints
- **Auth**
  - `POST /api/auth/login`
  - `POST /api/auth/register`
- **Flashcards**
  - `GET /api/flashcards`
  - `POST /api/flashcards`
  - `PUT /api/flashcards/:id`
  - `DELETE /api/flashcards/:id`
- **Questions**
  - `GET /api/questions`
  - `POST /api/questions`
  - `PUT /api/questions/:id`
  - `DELETE /api/questions/:id`

### 2.4. Authentication
- JWT tokens issued on login/register
- Middleware protects routes requiring authentication

---

## 3. Frontend Design

### 3.1. Folder Structure
- `src/app/pages/`
  - `login/`: Login page
  - `flashcards/`: Flashcard list and management
  - `questions/`: Question list and management
  - `add-question/`: Add new question form
- `auth.interceptor.ts`: Attaches JWT to outgoing requests
- `app.routes.ts`: Client-side routing
- `app.config.ts`: App configuration

### 3.2. Main Features
- **Login**: User authentication, error handling
- **Flashcards**: List, create, edit, delete flashcards
- **Questions**: List, create, edit, delete questions
- **Add Question**: Form for adding new questions
- **Routing**: Navigation between pages
- **Styling**: Responsive CSS for all pages

### 3.3. State Management
- Angular services for API communication
- Local storage for JWT token persistence

---

## 4. Security Considerations
- Passwords hashed before storage
- JWT tokens used for session management
- Input validation on both frontend and backend
- CORS configured for frontend-backend communication

---

## 5. Future Improvements
- Add user roles (admin, user)
- Implement quiz sessions and scoring
- Add support for image/media in questions/flashcards
- Improve UI/UX with advanced design frameworks
- Add unit and integration tests
- Enable social login (Google, Facebook)

---

## 6. Deployment
- **Backend**: Deployable on Node.js server (Heroku, AWS, etc.)
- **Frontend**: Deployable as static site (Vercel, Netlify, etc.)
- **Environment Variables**: Used for secrets and DB connection strings

---

## 7. References
- [Express.js Documentation](https://expressjs.com/)
- [Angular Documentation](https://angular.io/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

---

## 8. Contact
For questions or contributions, contact the repository owner or open an issue on GitHub.
