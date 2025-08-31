# HDElite Backend

A robust and secure backend API for the HDElite notes application, built with Node.js and Express. Provides authentication services and notes management with OTP verification and Google OAuth integration.

## Features

- **Authentication & Authorization**
  - User registration and login with email/phone
  - OTP verification via SMS/Email
  - Google OAuth 2.0 integration
  - JWT-based session management
  - Password hashing with bcrypt
- **Notes Management**
  - CRUD operations for notes
  - User-specific note isolation
  - Data validation and sanitization
- **Security**
  - Rate limiting for API endpoints
  - Input validation and sanitization
  - CORS configuration
  - Environment-based configuration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Passport.js (Google OAuth)
- **OTP Service**: Twilio (SMS) / SendGrid (Email)
- **Validation**: Joi / express-validator
- **Security**: Helmet, bcrypt, rate-limiter

## Prerequisites

- Node.js (version 16.0 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Twilio account (for SMS OTP)
- SendGrid account (for Email OTP)
- Google OAuth credentials

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hdelite-backend.git
cd hdelite-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
# Server Configuration
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/hdelite
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hdelite

# JWT Secret
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Server will start at `http://localhost:3001` with auto-reload enabled.

### Production Mode
```bash
npm start
```

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t hdelite-backend .
docker run -p 3001:3001 --env-file .env hdelite-backend
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Google OAuth
```http
GET /api/auth/google
# Redirects to Google OAuth consent screen

GET /api/auth/google/callback
# Google OAuth callback endpoint
```

### Notes Endpoints

All notes endpoints require Authentication header: `Authorization: Bearer <jwt_token>`

#### Get All Notes
```http
GET /api/notes
```

#### Create Note
```http
POST /api/notes
Content-Type: application/json

{
  "title": "My Note Title",
  "content": "Note content here...",
  "tags": ["work", "important"]
}
```

#### Get Single Note
```http
GET /api/notes/:id
```

#### Update Note
```http
PUT /api/notes/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "tags": ["updated", "work"]
}
```

#### Delete Note
```http
DELETE /api/notes/:id
```

## Project Structure

```
├── src/
│   ├── controllers/        # Route controllers
│   │   ├── authController.js
│   │   └── notesController.js
│   ├── models/            # Database models
│   │   ├── User.js
│   │   └── Note.js
│   ├── routes/            # Express routes
│   │   ├── auth.js
│   │   └── notes.js
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   └── config/            # Configuration files
│       ├── database.js
│       ├── passport.js
│       └── cors.js
├── tests/                 # Test files
├── docs/                  # API documentation
├── .env.example         # Docker Compose setup
└── server.tsx             # Application entry point
```


## Related Repositories

- **Frontend**: [hdelite-frontend](https://github.com/anuplohar001/hdelite-frontend)

---

Made with ❤️ by the HDElite Team