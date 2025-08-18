# Quizify

A full-stack quiz and flashcard application built with Angular and Express.js. The application supports user authentication, question management, and flashcard creation for educational purposes.

## Architecture

The project consists of two main components:

- **Frontend**: Angular 18 single-page application
- **Backend**: Express.js REST API with dual database support

## Tech Stack

### Frontend
- Angular 18
- TypeScript
- HTML/CSS
- HttpClient for API communication

### Backend
- Node.js with Express.js
- MySQL (for questions storage)
- MongoDB (for flashcards storage)
- JWT authentication
- bcryptjs for password hashing

## Project Structure

```
Quizify/
├── quizify-backend/          # Express.js API server
│   ├── models/               # Database models
│   ├── auth.middleware.js    # Authentication middleware
│   ├── auth.routes.js        # Authentication routes
│   ├── db.js                 # MySQL connection
│   ├── mongo.js              # MongoDB connection
│   ├── questions.routes.js   # Questions API endpoints
│   ├── flashcards.routes.js  # Flashcards API endpoints
│   └── server.js             # Main server file
└── quizify-frontend/         # Angular application
    └── src/
        └── app/
            └── pages/
                ├── login/        # Login component
                ├── questions/    # Questions management
                ├── add-question/ # Add new questions
                └── flashcards/   # Flashcards display
```

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- MySQL database
- MongoDB database
- Angular CLI

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Raken001/Quizify.git
cd Quizify
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Setup Backend

```bash
cd quizify-backend
npm install
```

Create a `.env` file in the `quizify-backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=quizify

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/quizify

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Server Configuration
PORT=8000
CORS_ORIGIN=http://localhost:4200
```

### 4. Setup Frontend

```bash
cd ../quizify-frontend
npm install
```

### 5. Database Setup

#### MySQL
Create a MySQL database and run the following SQL to create the questions table:

```sql
CREATE DATABASE quizify;
USE quizify;

CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  options JSON NOT NULL,
  correct_answer VARCHAR(255) NOT NULL,
  difficulty_level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### MongoDB
MongoDB collections will be created automatically when the application runs.

## Running the Application

### Development Mode

You need to run both the backend and frontend servers simultaneously.

#### Terminal 1: Start Backend Server

```bash
cd quizify-backend
npm run dev
```

The backend server will start at `http://localhost:8000`

#### Terminal 2: Start Frontend Server

```bash
cd quizify-frontend
npm start
```

The frontend application will start at `http://localhost:4200`

### Production Mode

#### Backend

```bash
cd quizify-backend
npm start
```

#### Frontend

```bash
cd quizify-frontend
npm run build
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /me` - Get current user info (protected)

### Questions
- `GET /questions` - Get all questions (protected)
- `POST /questions/add` - Add new question (protected)
- `PUT /questions/update/:id` - Update question (protected)
- `DELETE /questions/delete/:id` - Delete question (protected)

### Flashcards
- `GET /flashcards` - Get all flashcards (protected)
- `POST /flashcards` - Create new flashcard (protected)
- `DELETE /flashcards/:id` - Delete flashcard (protected)

### Health Check
- `GET /health` - Server health status

## Features

- User registration and authentication
- JWT-based session management
- Question creation with multiple choice options
- Flashcard generation from questions
- CRUD operations for questions and flashcards
- Responsive web interface
- Protected routes with authentication middleware

## Database Design

### MySQL (Questions)
The application uses MySQL to store quiz questions with the following structure:
- Questions with multiple choice options
- Difficulty levels
- Subject categorization

### MongoDB (Flashcards)
MongoDB stores flashcard data with flexible document structure:
- Question-answer pairs
- User-specific flashcards
- Additional metadata

## Development

### Adding New Features

1. Backend: Add routes in the appropriate route files
2. Frontend: Create new components in the `pages` directory
3. Update routing in `app.routes.ts`

### Code Style

The project uses Prettier for code formatting with the following configuration:
- Print width: 100 characters
- Single quotes
- Specific overrides for different file types

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
